# Feature Flags

Feature flags in the Aragon App allow developers to enable or disable certain features depending on the current environment.

Feature flags are managed through environment variables, which are set in the respective `.env.production`, `.env.development`, and `.env.staging` files. Depending on the environment the user is currently using, the corresponding feature flags for that environment are loaded and used.

Additionally, feature flags can be overridden using query parameters in the application's URL, which allows enabling or disabling specific features regardless of the environment's default settings. This is particularly useful for enabling and testing features on the production environment that are disabled by default.

## Usage of Environment Variables

In order to add a feature flag, update the environment files as follows:

```plaintext
# .env.production
VITE_FEATURE_FLAG_DISCOVER_DAO=false

# .env.development
VITE_FEATURE_FLAG_DISCOVER_DAO=true

# .env.staging
VITE_FEATURE_FLAG_DISCOVER_DAO=true
```

In the above example, the `VITE_FEATURE_FLAG_DISCOVER_DAO` feature flag is enabled in the development and staging environments but disabled in production.

## Overriding Feature Flags

To override a feature flag for the current environment, simply append the key and value of the feature flag to the URL as a query parameter and start using the Aragon App:

```
https://app.aragon.org?VITE_FEATURE_FLAG_DISCOVER_DAO=true
```

Using the above URL, the `VITE_FEATURE_FLAG_DISCOVER_DAO` flag will be set to true, regardless of the value set in the `.env.production` file. This override will be effective for the whole session, even if the URL changes within the same session. To restore the value of the feature flag to its default or environment-specific setting, the user needs to open the website on a new session.
