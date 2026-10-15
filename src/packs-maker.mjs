import path from 'path';
//import fs from 'fs';
import { Command } from 'commander';
import { compilePack, extractPack } from '@foundryvtt/foundryvtt-cli';
import os from 'os';

/**
 * Path of the Polaris system in the Foundry data folder: FOUNDRY_DATA_PATH if
 * set, else the default location for WSL or Linux.
 * @returns {string}
 */
function resolveFoundryPath() {
  // Override manually if necessary (new workstation, special circumstances, etc.)
  if (process.env.FOUNDRY_DATA_PATH) {
    return `${process.env.FOUNDRY_DATA_PATH}/systems/polaris`;
  }

  const isWSL =
    Boolean(process.env.WSL_DISTRO_NAME) || os.release().toLowerCase().includes('microsoft');

  return isWSL
    ? `${process.env.HOME}/foundrydata/Data/systems/polaris`
    : `${process.env.HOME}/.local/share/FoundryVTT/Data/systems/polaris`;
}

const foundryPath = resolveFoundryPath();

const CONFIG = {
  dataPath: 'packs',
  sourcePath: '_source',
  distDataPath: `${foundryPath}/packs`,
  databases: ['skills'],
  yaml: true,
};

/**
 * Extracts the compiled compendium databases into YAML sources (`_source/`).
 * @returns {Promise<void>}
 */
export async function extract() {
  for (const db of CONFIG.databases) {
    const dbPath = path.join(CONFIG.distDataPath, db);
    const sourcePath = path.join(CONFIG.sourcePath, db);
    await extractPack(dbPath, sourcePath, { yaml: CONFIG.yaml, clean: true });
    console.log(`Extracted database: ${db}`);
  }
  console.log(`Successfully extracted ${CONFIG.databases.length} databases.`);
}

/**
 * Compiles the YAML sources (`_source/`) into compendium databases (`packs/`).
 * @returns {Promise<void>}
 */
export async function compile() {
  for (const db of CONFIG.databases) {
    const dbPath = path.join(CONFIG.dataPath, db);
    const sourcePath = path.join(CONFIG.sourcePath, db);
    await compilePack(sourcePath, dbPath, { yaml: CONFIG.yaml });
    console.log(`Compiled database: ${db}`);
  }
  console.log(`Successfully compiled ${CONFIG.databases.length} databases.`);
}

const startup = new Command();

startup.name('foundrybuild').description('Module development and packaging tools');

/* LevelDB format compiling from extracted plain-text files */
startup
  .command('compile')
  .description('Constructs binary databases from plain-text source files.')
  .action(compile);

/* Plain-text format extraction from LevelDB directory */
startup
  .command('extract')
  .description('Unpacks binary databases into plain-text source files.')
  .action(extract);

/* Start program and parse commands */
startup.parseAsync();
