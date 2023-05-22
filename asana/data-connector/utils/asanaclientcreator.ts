import {Client} from 'asana';

class FlowType {
    constructor() {}
    public authorizeUrl(): string {
        throw 'No way to get authorizeUrl';
    }
    public async run() {
        throw 'No way to reauthorize: running';
    }
}

/**
 * List of API changes to opt-into.
 *
 * Asana's API changes by requiring you to opt in or out of new functionionality
 * for a while. If you get a log message that looks like:
 * > Adding "new_goal_memberships" to your "Asana-Enable" or "Asana-Disable" header will opt in/out to this deprecation and suppress this warning.
 * > This request is affected by the "new_goal_memberships" deprecation. Please visit this url for more info: https://forum.asana.com/t/upcoming-changes-that-impact-getting-and-setting-memberships-and-access-levels/232106?u
 *
 * then you should try adding the the mentioned string ("new_goal_memberships" in the example) to the list below. It Asana
 * continues to work, great, you're done. Otherwise either fix the data-connector to work with the new behavior
 * or explicitly opt out with a "asana-disable" header and add a JIRA ticket to go and fix it later. Mention the JIRA ticket
 * in a code comment near your disable header.
 **/
export const asanaApiEnables = [
    'new_user_task_lists',
    'new_project_templates',
    'new_memberships',
    'new_goal_memberships',
];

export function defaultClientCreator(credential: string | {access_token: string; refresh_token: string}): Client {
    const client = Client.create({
        'defaultHeaders': {'asana-enable': asanaApiEnables.join(',')},
    });
    return client.useOauth({
        credentials: credential,
        flowType: FlowType,
    });
}

// Responding with a 410 during receive-update tells Asana to clean up that webhook
export const deleteAsanaWebhookResponse = {
    status: 410,
    headers: {},
    body: '',
};
