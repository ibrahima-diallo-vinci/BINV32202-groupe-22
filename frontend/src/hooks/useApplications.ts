import { useCallback, useEffect, useState } from "react";
import type { Application } from "../models/application.ts";
import {
  createApplication,
  getApplications,
  withdrawApplication,
} from "../services/applications.service.ts";
import { isUnauthorized } from "../utils/api.ts";

interface ApplicationResult {
  token: string;
  applications: Application[];
  error: string | null;
}

export const useApplications = (
  token: string,
  onUnauthorized: () => void,
  enabled = true,
) => {
  const [result, setResult] = useState<ApplicationResult | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    getApplications(token, controller.signal)
      .then((applications) => {
        if (!controller.signal.aborted) {
          setResult({ token, applications, error: null });
        }
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        if (isUnauthorized(reason)) {
          onUnauthorized();
        } else {
          setResult({
            token,
            applications: [],
            error: reason instanceof Error ? reason.message : "Erreur inconnue",
          });
        }
      });

    return () => controller.abort();
  }, [enabled, onUnauthorized, token]);

  const apply = useCallback(
    async (offerId: number, message: string): Promise<boolean> => {
      setMutationError(null);
      setIsMutating(true);
      try {
        const application = await createApplication(token, offerId, message);
        setResult((current) =>
          current?.token === token
            ? { ...current, applications: [application, ...current.applications] }
            : current,
        );
        return true;
      } catch (reason) {
        if (isUnauthorized(reason)) {
          onUnauthorized();
        } else {
          setMutationError(reason instanceof Error ? reason.message : "Erreur inconnue");
        }
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [onUnauthorized, token],
  );

  const withdraw = useCallback(
    async (applicationId: number): Promise<boolean> => {
      setMutationError(null);
      setIsMutating(true);
      try {
        await withdrawApplication(token, applicationId);
        setResult((current) =>
          current?.token === token
            ? {
                ...current,
                applications: current.applications.map((application) =>
                  application.id === applicationId
                    ? { ...application, status: "WITHDRAWN" }
                    : application,
                ),
              }
            : current,
        );
        return true;
      } catch (reason) {
        if (isUnauthorized(reason)) {
          onUnauthorized();
        } else {
          setMutationError(reason instanceof Error ? reason.message : "Erreur inconnue");
        }
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [onUnauthorized, token],
  );

  const hasCurrentResult = enabled && result !== null && result.token === token;
  return {
    applications: hasCurrentResult ? result.applications : [],
    isLoading: enabled && !hasCurrentResult,
    error: hasCurrentResult ? result.error : null,
    mutationError,
    isMutating,
    apply,
    withdraw,
  };
};
