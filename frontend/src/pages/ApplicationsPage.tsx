import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import StatusBadge from "../components/StatusBadge.tsx";
import { useApplications } from "../hooks/useApplications.ts";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
  PERIOD_LABELS,
} from "../utils/labels.ts";

interface ApplicationsPageProps {
  token: string;
  onUnauthorized: () => void;
}

const ApplicationsPage = ({ token, onUnauthorized }: ApplicationsPageProps) => {
  const {
    applications,
    isLoading,
    error,
    mutationError,
    isMutating,
    withdraw,
  } = useApplications(token, onUnauthorized);

  const renderContent = () => {
    if (error) return <ErrorState message={error} />;
    if (isLoading) return <LoadingState />;
    if (applications.length === 0) {
      return <EmptyState message="Vous n'avez pas encore candidaté à une offre." />;
    }

    return (
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Offre</th>
              <th scope="col">Entreprise</th>
              <th scope="col">Année</th>
              <th scope="col">Période</th>
              <th scope="col">Candidature</th>
              <th scope="col">Message</th>
              <th scope="col">Date</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id}>
                <td>{application.offer.title}</td>
                <td>{application.offer.companyShortName}</td>
                <td>{application.offer.academicYear}</td>
                <td>{PERIOD_LABELS[application.offer.period]}</td>
                <td>
                  <StatusBadge
                    label={APPLICATION_STATUS_LABELS[application.status]}
                    tone={APPLICATION_STATUS_TONES[application.status]}
                  />
                </td>
                <td>{application.message ?? "—"}</td>
                <td>{application.appliedAt}</td>
                <td>
                  {application.status === "IN_PROGRESS" && (
                    <button
                      className="button button-secondary"
                      type="button"
                      disabled={isMutating}
                      onClick={() => void withdraw(application.id)}
                    >
                      Retirer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section>
      <h1>Mes candidatures</h1>
      <p>Consultez le statut de vos candidatures aux offres de stage.</p>
      {mutationError && <ErrorState message={mutationError} />}
      {renderContent()}
    </section>
  );
};

export default ApplicationsPage;
