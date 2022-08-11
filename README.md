# pareto-ui
User Interface for the PARETO project

## Getting started (developer)

### Prerequisites

The following steps assume that:

1. `conda` is already installed and configured
2. This repository (i.e. the WaterTAP UI repository, https://github.com/watertap-org/watertap-ui) has been cloned locally and the working directory is set to the root of the repository

### 1. Creating the Conda environment

Run the following command to create and activate a new Conda environment named `pareto-ui-env`:

```sh
conda env create --file environment.yml && conda activate pareto-ui-env
```

This will install the correct runtime versions of both the backend (Python) and frontend (JavaScript/NodeJS/Electron) portions of the UI, as well as the backend (Python) dependencies.

### 2. Install the IDAES solver dependencies

```sh
idaes get-extensions --verbose
```

### 3. Install Javascript dependencies

Prerequisites: Node Package Manager (npm)

```console
cd <pareto-ui-path>/electron
npm clean-install
```

### Run UI in browser

```console
cd <pareto-ui-path>/electron
npm run app-start
```

### Run UI with electron

```console
cd <pareto-ui-path>/electron
npm run electron-start
```