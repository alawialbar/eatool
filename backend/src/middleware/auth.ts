import { Request, Response, NextFunction } from "express";
import { CognitoJwtVerifier } from "aws-jwt-verify";

let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
  if (!verifier) {
    const userPoolId = process.env.COGNITO_USER_POOL_ID || "";
    const clientId = process.env.COGNITO_CLIENT_ID || "";

    if (!userPoolId || !clientId) {
      throw new Error("COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID must be set");
    }

    verifier = CognitoJwtVerifier.create({
      userPoolId,
      clientId,
      tokenUse: "access",
    });
  }
  return verifier;
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const payload = await getVerifier().verify(token);

    req.user = {
      sub: payload.sub,
      email: (payload as Record<string, unknown>).email as string || "",
      groups: ((payload as Record<string, unknown>)["cognito:groups"] as string[]) || [],
    };

    next();
  } catch (error) {
    console.error("Auth verification failed:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
}

export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    const payload = await getVerifier().verify(token);

    req.user = {
      sub: payload.sub,
      email: (payload as Record<string, unknown>).email as string || "",
      groups: ((payload as Record<string, unknown>)["cognito:groups"] as string[]) || [],
    };
  } catch (error) {
    // Token invalid — proceed without user context
  }

  next();
}
