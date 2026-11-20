import { useEffect, useState } from "react";
import type { Offer, PeriodCode } from "../models/offer.ts";
import { getOffers } from "../services/offers.service.ts";
import { isUnauthorized } from "../utils/api.ts";

/**
 * Offres visibles par l'utilisateur, choisies par le backend selon son profil.
 * onUnauthorized doit être stable (useCallback) pour ne pas relancer le chargement.
 */
export const useOffers = (
  token: string,
  onUnauthorized: () => void,
  period?: PeriodCode,
  search = "",
) => {
  const normalizedSearch = search.trim();
  const [result, setResult] = useState<{
    token: string;
    period: PeriodCode | undefined;
    search: string;
    offers: Offer[];
    error: string | null;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getOffers(token, period, normalizedSearch, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setResult({ token, period, search: normalizedSearch, offers: data, error: null });
        }
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        if (isUnauthorized(reason)) {
          onUnauthorized();
        } else {
          setResult({
            token,
            period,
            search: normalizedSearch,
            offers: [],
            error: reason instanceof Error ? reason.message : "Erreur inconnue",
          });
        }
      });

    return () => controller.abort();
  }, [token, onUnauthorized, period, normalizedSearch]);

  const hasCurrentResult =
    result !== null &&
    result.token === token &&
    result.period === period &&
    result.search === normalizedSearch;
  return {
    offers: hasCurrentResult ? result.offers : [],
    isLoading: !hasCurrentResult,
    error: hasCurrentResult ? result.error : null,
  };
};
