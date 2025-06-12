# Tasks to Fix Language Switching Bug

Implement the changes needed so that switching from Swedish to English updates the whole app consistently.
**Why?** A second change handler in `SettingsManager` reads the DOM value but never calls `setLang`, leaving the context unchanged when switching back to English.

1. **Wire `setLang` into `SettingsManager`**
   - Add a parameter for `setLang` in `SettingsManager`'s constructor after `notificationSystem` and before the `t` argument. Store it on the instance.
   - In `initEventListeners()`, update the language `<select>` handler to call `this.setLang(e.target.value)` and display the translated toast using `this.t('toast.settings.langChanged', { lang: e.target.selectedOptions[0].text })`.
   - Ensure `SettingsManager` is created with `setLang` in `src/pages/Settings.jsx`.

2. **Remove duplicate `onChange`**
   - The `<select>` in `Settings.jsx` is already controlled via `value={lang}`. Remove its inline `onChange` prop but keep the `value` binding so the element stays controlled.

3. **Optional clean-ups**
   - Initialise `lang` lazily in `I18nProvider` to avoid a flash of the default language.
   - Memoise the context value with `useCallback`/`useMemo` to reduce re-renders across the app.
   - Localise notification messages ("Settings saved successfully", "Language changed to …" etc.) by moving them into `translations.js`.
   - Delete any obsolete comments about where a language change would occur.
   - Fix Swedish typos in `translations.js` under the `sv` locale: "Banf riktionsbedömning" → "Banfriktionsbedömning" and "Banf information" → "Bansinformation".

After implementing these tasks, the language selector should update the React context correctly and the UI will no longer get stuck in Swedish.

## Testing checklist

- Switch `en → sv → en`, verify navbar, toasts and headings update immediately.
- Refresh the page and ensure the chosen language persists.
