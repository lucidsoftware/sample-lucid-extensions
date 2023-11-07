The AI Prompt Flow extension has an Angular library shared by two Angular projects. To do local development, you will need all three to be built/running:

-   `npx ng build shared --watch`
-   `npx ng serve leftpanel --port 4200`
-   `npx ng serve rightpanel --port 4201`

For convenience, you can run `npm run serve-all` from this directory to build/watch the shared library and serve both panels. Note that if you try to `ng serve` an application while the `shared` library is still building, `ng serve` will fail. Incremental builds are fast enough to not cause issues. For this reason, there is a 2 second delay between starting `ng build shared --watch` and `ng serve {panel}`. If `shared` grows large enough, the delay may need to be increased.
