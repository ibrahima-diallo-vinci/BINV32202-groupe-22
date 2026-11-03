import { useState } from "react";
import type { ApplicationStatus } from "../models/application.ts";
import type { Offer } from "../models/offer.ts";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
  OFFER_STATUS_LABELS,
  OFFER_STATUS_TONES,
  PERIOD_LABELS,
} from "../utils/labels.ts";
import StatusBadge from "./StatusBadge.tsx";

interface OfferTableProps {
  offers: Offer[];
  applicationStatuses?: ReadonlyMap<number, ApplicationStatus>;
  onApply?: (offerId: number, message: string) => Promise<boolean>;
  isApplicationsLoading?: boolean;
  isApplying?: boolean;
}

interface OfferApplicationActionProps {
  offer: Offer;
  status: ApplicationStatus | undefined;
  onApply: (offerId: number, message: string) => Promise<boolean>;
  isLoading: boolean;
  isApplying: boolean;
}

const OfferApplicationAction = ({
  offer,
  status,
  onApply,
  isLoading,
  isApplying,
}: OfferApplicationActionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  if (status !== undefined && status !== "WITHDRAWN") {
    return (
      <StatusBadge
        label={APPLICATION_STATUS_LABELS[status]}
        tone={APPLICATION_STATUS_TONES[status]}
      />
    );
  }

  if (!isOpen) {
    return (
      <button
        className="button button-primary"
        type="button"
        disabled={isLoading || offer.status !== "PUBLISHED"}
        onClick={() => setIsOpen(true)}
      >
        Candidater
      </button>
    );
  }

  return (
    <form
      className="application-form"
      onSubmit={(event) => {
        event.preventDefault();
        void onApply(offer.id, message).then((success) => {
          if (success) {
            setIsOpen(false);
            setMessage("");
          }
        });
      }}
    >
      <label htmlFor={`application-message-${offer.id}`}>Message facultatif</label>
      <textarea
        id={`application-message-${offer.id}`}
        value={message}
        rows={3}
        onChange={(event) => setMessage(event.target.value)}
      />
      <div className="application-form-actions">
        <button className="button button-primary" type="submit" disabled={isApplying}>
          Envoyer ma candidature
        </button>
        <button
          className="button button-secondary"
          type="button"
          disabled={isApplying}
          onClick={() => {
            setIsOpen(false);
            setMessage("");
          }}
        >
          Annuler
        </button>
      </div>
    </form>
  );
};

const OfferTable = ({
  offers,
  applicationStatuses,
  onApply,
  isApplicationsLoading = false,
  isApplying = false,
}: OfferTableProps) => (
  <div className="table-wrapper">
    <table className="data-table">
      <thead>
        <tr>
          <th scope="col">Titre</th>
          <th scope="col">Entreprise</th>
          <th scope="col">Année</th>
          <th scope="col">Période</th>
          <th scope="col">Statut</th>
          {onApply && <th scope="col">Candidature</th>}
        </tr>
      </thead>
      <tbody>
        {offers.map((offer) => (
          <tr key={offer.id}>
            <td>{offer.title}</td>
            <td>{offer.companyShortName}</td>
            <td>{offer.academicYear}</td>
            <td>{PERIOD_LABELS[offer.period]}</td>
            <td>
              <StatusBadge
                label={OFFER_STATUS_LABELS[offer.status]}
                tone={OFFER_STATUS_TONES[offer.status]}
              />
            </td>
            {onApply && (
              <td>
                <OfferApplicationAction
                  offer={offer}
                  status={applicationStatuses?.get(offer.id)}
                  onApply={onApply}
                  isLoading={isApplicationsLoading}
                  isApplying={isApplying}
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default OfferTable;
