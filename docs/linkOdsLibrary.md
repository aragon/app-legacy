# Local Development with Linked ODS Library

To facilitate testing and development of the Aragon ODS library locally, you can create a link to the `@aragon/ods`
package and integrate it into your cdDAO App environment. In order to do so, follow the steps below:

1.  Navigate to the `@aragon/ods` directory and execute the following commands to create a link to the package and initiate
    continuous building in watch mode:

        ```
        yarn link
        yarn build:watch
        ```

    This will enable real-time updates as you make changes to the ODS library.

2.  Move to the `@aragon/app` directory and use the linked `@aragon/ods` package. Initiate the development server in
    watch mode using the following commands:

        ```
        yarn link @aragon/ods
        yarn dev:watch
        ```

    With this setup, any change made to the `@aragon/ods` library files will trigger an automatic rebuild of the package.
    Consequently, the cdDAO App server will be reloaded, ensuring that the latest changes from the ODS library are integrated.
