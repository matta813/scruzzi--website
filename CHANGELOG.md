## [1.3.2](https://github.com/matta813/scruzzi--website/compare/v1.3.1...v1.3.2) (2026-08-15)

## [1.3.1](https://github.com/matta813/scruzzi--website/compare/v1.3.0...v1.3.1) (2026-08-15)

## [1.3.0](https://github.com/matta813/scruzzi--website/compare/v1.2.1...v1.3.0) (2026-07-27)

## [1.2.1](https://github.com/matta813/scruzzi--website/compare/v1.2.0...v1.2.1) (2026-07-27)

### Bug Fixes

* chown copied files to the app user in Dockerfile ([e4d299a](https://github.com/matta813/scruzzi--website/commit/e4d299a925580bc57e91670c2dc3b367fd497d28))

## [1.2.0](https://github.com/matta813/scruzzi--website/compare/v1.1.0...v1.2.0) (2026-07-27)

### Features

* add gzip compression, ETag caching and favicon/robots serving ([c36a895](https://github.com/matta813/scruzzi--website/commit/c36a89502d90a62acd824ec99f3f853c80bd5bd9))
* add SEO metadata, structured data and theme-toggle aria state ([2c0011a](https://github.com/matta813/scruzzi--website/commit/2c0011a5e31c2ee804cc74d478e8e3d678c2c901))

### Bug Fixes

* mark server.py executable to satisfy ruff EXE001 ([6385a0b](https://github.com/matta813/scruzzi--website/commit/6385a0ba0994f1203c83920dff6cf11916ee2cb8))

## [1.1.0](https://github.com/matta813/scruzzi--website/compare/v1.0.2...v1.1.0) (2026-07-27)

### Features

* add social preview meta tags and theme-color ([aa98039](https://github.com/matta813/scruzzi--website/commit/aa9803936917437805f387b3256a7efabbea052e))

### Bug Fixes

* correct HEAD handling on keep-alive connections and harden headers ([8814768](https://github.com/matta813/scruzzi--website/commit/881476888d6d2913deec15fb040208bfd8a004a8))

## [1.0.2](https://github.com/matta813/scruzzi--website/compare/v1.0.1...v1.0.2) (2026-07-21)

### Bug Fixes

* year in live segment on top of the page to 3rd not 1st ([a1b93a5](https://github.com/matta813/scruzzi--website/commit/a1b93a5506c6b1154177176fc817d9e5bc489750))

## [1.0.1](https://github.com/matta813/scruzzi--website/compare/v1.0.0...v1.0.1) (2026-07-21)

### Bug Fixes

* year in Ausbldung segment ([1134121](https://github.com/matta813/scruzzi--website/commit/1134121be9a9b31562c660800c837a46d75edd91))

## 1.0.0 (2026-07-21)

### Features

* add interactive 'Bauch-Meter' with animations and local storage ([c04d8a4](https://github.com/matta813/scruzzi--website/commit/c04d8a4cade604cc1409e3f029041d514009dc63))
* add landing page, startup script and documentation ([1d06c1b](https://github.com/matta813/scruzzi--website/commit/1d06c1bbd6a1795aa205dbddb966604e60394006))
* add much more variety to quotes ([df4eb95](https://github.com/matta813/scruzzi--website/commit/df4eb95551655e1790d222f3023d142eaf2107aa))
* add secure and optimized nginx configuration ([53bf949](https://github.com/matta813/scruzzi--website/commit/53bf949284dde050c8855f9c854ffb230646d026))
* add tracking script for enhanced analytics and user engagement ([979d45b](https://github.com/matta813/scruzzi--website/commit/979d45b516d3c7cc8a1d527dae3ae7164d5a63ca))
* **ci:** automatic semver releases with GitOps image bump ([4406459](https://github.com/matta813/scruzzi--website/commit/4406459f96db03ae745c4d38e3944a3497b59c2f))
* enhance user interface with new score tracking system, improved styling, and interactive elements ([0763ed3](https://github.com/matta813/scruzzi--website/commit/0763ed3f96a951107997e26406e76e25d089ac0e))
* migrate to Python-based server, implement server-side device storage, and enhance health check mechanism ([ed991b0](https://github.com/matta813/scruzzi--website/commit/ed991b07bb380192a793b2d2c064a3c3d8847275))
* modernize UX with confetti, improve security with unprivileged nginx, and sync registry settings ([f89fe27](https://github.com/matta813/scruzzi--website/commit/f89fe277a543cfb5f1ee5507c1e8942637cb7614))
* update Content-Security-Policy to include tracking domain for improved analytics ([3253b2f](https://github.com/matta813/scruzzi--website/commit/3253b2f6b8680bd3f4d27229712e4d08d56051a5))

### Bug Fixes

* add build context to docker-compose.yaml to allow local builds ([2414607](https://github.com/matta813/scruzzi--website/commit/24146079168ec00688a9737fb3d1e8b72460d5ad))
* change lint job to run on ubuntu-latest instead of self-hosted ([e781923](https://github.com/matta813/scruzzi--website/commit/e7819239b220d6c2209ffef2ed3944a9a6c6da4f))
* force build without cache and add cache busting for css/js ([08d91f5](https://github.com/matta813/scruzzi--website/commit/08d91f5fb9888c83526c239307a60db4850b01c2))
* macOS compatibility in bash script and native docker compose build ([8ad9b61](https://github.com/matta813/scruzzi--website/commit/8ad9b61f4267a7bb00cac99f43140ef048ba19c9))
* simplify docker image names to avoid 'name invalid' errors ([b245b68](https://github.com/matta813/scruzzi--website/commit/b245b68d60c94a13a945f2a063c200af3968c6cd))
* use native docker commands to avoid GitHub action clone issues ([a9f8b6b](https://github.com/matta813/scruzzi--website/commit/a9f8b6b2d14a89b722877aba1b795a1feed3abdd))
