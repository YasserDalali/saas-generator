import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { isSpoofedBot } from "@arcjet/inspect";
import { Request, Response, NextFunction } from "express";
import chalk from "chalk";

if (!process.env.ARCJET_KEY) {
    console.error(chalk.bgRed.white('ERROR: '), chalk.red("ARCJET_KEY is not set") );
    process.exit(1);
}

const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
});

// Arcjet middleware
const arcjetMiddleware = (tokensRequested: number = 1) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decision = await aj.protect(req, { requested: tokensRequested });
      console.log("Arcjet decision", decision);

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({ error: "Too Many Requests" });
        } else if (decision.reason.isBot()) {
          return res.status(403).json({ error: "No bots allowed" });
        } else {
          return res.status(403).json({ error: "Forbidden" });
        }
      } else if (decision.results.some(isSpoofedBot)) {
        // Arcjet Pro plan verifies the authenticity of common bots using IP data.
        // Verification isn't always possible, so we recommend checking the decision
        // separately.
        // https://docs.arcjet.com/bot-protection/reference#bot-verification
        return res.status(403).json({ error: "Forbidden" });
      } else {
        // Protection passed, continue to next middleware
        next();
      }
    } catch (error) {
      console.error("Arcjet middleware error:", error);
      // In case of error, you might want to allow the request or deny it
      // For security, we'll deny by default
      return res.status(500).json({ error: "Security check failed" });
    }
  };
};

export default arcjetMiddleware;

