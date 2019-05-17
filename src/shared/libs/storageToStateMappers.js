import assign from 'lodash/assign';
import filter from 'lodash/filter';
import map from 'lodash/map';
import transform from 'lodash/transform';
import { Account, Node, Wallet } from '../storage';

/**
 * Map persisted state to redux state
 * @method mapStorageToState
 *
 * @returns {object}
 */
export const mapStorageToState = () => {
    Account.orderAccountsByIndex();
    const accountsData = Account.getDataAsArray();

    const { settings, onboardingComplete, errorLog, accountInfoDuringSetup } = Wallet.latestDataAsPlainObject;
    const nodes = Node.getDataAsArray();

    return {
        accounts: {
            accountInfoDuringSetup,
            onboardingComplete,
            ...transform(
                accountsData,
                (acc, data) => {
                    const {
                        name,
                        usedExistingSeed,
                        displayedSnapshotTransitionGuide,
                        meta,
                        index,
                        addressData,
                        transactions,
                    } = data;

                    acc.accountInfo[name] = {
                        index,
                        meta,
                        addressData,
                        transactions,
                    };

                    acc.setupInfo[name] = { usedExistingSeed };
                    acc.tasks[name] = { displayedSnapshotTransitionGuide };
                },
                {
                    accountInfo: {},
                    setupInfo: {},
                    tasks: {},
                },
            ),
        },
        settings: assign({}, settings, {
            nodes: map(nodes, ({ url, pow, token, password }) => ({ url, pow, token, password })),
            availableCurrencies: map(settings.availableCurrencies, (currency) => currency),
            customNodes: map(filter(nodes, (node) => node.custom === true), ({ url, pow, token, password }) => ({
                url,
                pow,
                token,
                password,
            })),
        }),
        alerts: { notificationLog: map(errorLog, (error) => error) },
    };
};
