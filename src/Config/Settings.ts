import { Feature } from './Feature';
import type { FeatureFlag } from './Feature';

interface SettingsMap {
    [key: string]: string | boolean;
}

export type HeadingState = {
    [id: string]: boolean;
};

export interface Settings {
    globalFilter: string;
    removeGlobalFilter: boolean;
    setDoneDate: boolean;
    autoSuggestInEditor: boolean;
    autoSuggestMinMatch: number;
    autoSuggestMaxItems: number;
    provideAccessKeys: boolean;
    useFilenameAsScheduledDate: boolean;
    filenameAsDateFolders: string[];

    // Collection of feature flag IDs and their state.
    features: FeatureFlag;

    // Settings are moved to a more general map to allow the settings UI to be
    // dynamically generated.
    generalSettings: SettingsMap;

    // Tracks the stage of the headings in the settings UI.
    headingOpened: HeadingState;
}

const defaultSettings: Settings = {
    globalFilter: '',
    removeGlobalFilter: false,
    setDoneDate: true,
    autoSuggestInEditor: true,
    autoSuggestMinMatch: 0,
    autoSuggestMaxItems: 6,
    provideAccessKeys: true,
    useFilenameAsScheduledDate: false,
    filenameAsDateFolders: [],
    features: Feature.settingsFlags,
    generalSettings: {
        globalFilter: '',
        removeGlobalFilter: false,
        setDoneDate: true,

        // Allows the filter to be pushed to the end of the tag. Available if APPEND_GLOBAL_FILTER feature enabled.
        appendGlobalFilter: false,

        defaultRenderTemplate: '',
    },
    headingOpened: {},
};

let settings: Settings = { ...defaultSettings };

/**
 * Returns the current settings as a object, it will also check and
 * update the flags to make sure they are all shown in the data.json
 * file. Exposure via the settings UI is optional.
 *
 * @export
 * @returns true if the feature is enabled.
 */
export const getSettings = (): Settings => {
    // Check to see if there is a new flag and if so add it to the users settings.
    for (const flag in Feature.settingsFlags) {
        if (settings.features[flag] === undefined) {
            settings.features[flag] = Feature.settingsFlags[flag];
        }
    }

    return { ...settings };
};

export const updateSettings = (newSettings: Partial<Settings>): Settings => {
    settings = { ...settings, ...newSettings };

    return getSettings();
};

export const resetSettings = (): Settings => {
    return updateSettings(defaultSettings);
};

export const updateGeneralSetting = (name: string, value: string | boolean): Settings => {
    settings.generalSettings[name] = value;

    // sync the old settings for the moment so a larger change is not needed.
    updateSettings({
        globalFilter: <string>settings.generalSettings['globalFilter'],
        removeGlobalFilter: <boolean>settings.generalSettings['removeGlobalFilter'],
        setDoneDate: <boolean>settings.generalSettings['setDoneDate'],
    });

    return getSettings();
};

/**
 * Returns the enabled state of the feature from settings.
 *
 * @export
 * @param internalName the internal name of the feature.
 * @returns true if the feature is enabled.
 */
export const isFeatureEnabled = (internalName: string): boolean => {
    return settings.features[internalName] ?? false;
};

/**
 * enables toggling the feature and returning the current collection with state.
 *
 * @export
 * @param internalName the internal name of the feature.
 * @param enabled the expected state of the feature.
 * @returns the features with the specified feature toggled.
 */
export const toggleFeature = (internalName: string, enabled: boolean): FeatureFlag => {
    settings.features[internalName] = enabled;
    return settings.features;
};
