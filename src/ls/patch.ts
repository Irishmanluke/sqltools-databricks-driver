import https from "https";

import HttpConnection from "@databricks/sql/dist/connection/connections/HttpConnection";
import IAuthentication from "@databricks/sql/dist/connection/contracts/IAuthentication";
import IConnectionOptions from "@databricks/sql/dist/connection/contracts/IConnectionOptions";
import IThriftConnection from "@databricks/sql/dist/connection/contracts/IThriftConnection";

// Make sure we only patch once
let PATCHED = false;

// enable http keep-alive until https://github.com/databricks/databricks-sql-nodejs/pull/24 is released
export function patchHttpConnection() {
    if (PATCHED) {
        return;
    }

    const connect = HttpConnection.prototype.connect;
    HttpConnection.prototype.connect = function (
        options: IConnectionOptions,
        authProvider: IAuthentication
    ): Promise<IThriftConnection> {
        options.options = options.options || {};
        options.options.nodeOptions = options.options.nodeOptions || {};

        options.options.nodeOptions.agent = new https.Agent({
            keepAlive: true,
            maxSockets: 5,
            keepAliveMsecs: 10000,
        });

        return connect.apply(this, [options, authProvider]);
    };

    PATCHED = true;
}