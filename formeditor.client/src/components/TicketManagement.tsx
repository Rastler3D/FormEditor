import { useLanguage } from "~/contexts/LanguageContext";

function TicketManagement() {
    const { t } = useLanguage();

    return (
        <div class="space-y-6">
            <h3 class="text-lg font-semibold mb-2">{t("YourJiraTickets")}</h3>
            {/* Add Jira tickets list component here */}
        </div>
    );
}

export default TicketManagement;