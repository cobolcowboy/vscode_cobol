'use strict';

import { Range, TextDocument, workspace, Definition, Position, CancellationToken, ProviderResult, Uri } from 'vscode';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { getcopybookdirs, logMessage, logException, isFile } from './extension';
import { VSCOBOLConfiguration } from './configuration';

export function isValidExtension(filename: string): boolean {
    switch (filename) {
        case "tags":
        case ".tag":
        case ".ctags":
        case ".diff":
        case ".c":
        case ".h":
            return false;
    }
    const exts = VSCOBOLConfiguration.getExtentions();
    for (let extpos = 0; extpos < exts.length; extpos++) {
        let ext = exts[extpos];
        if (ext.length !== 0) {
            if (filename.endsWith(ext)) {
                return true;
            }
        } else {
            // true to parse it, if we have no extension
            if (filename.indexOf(".") === -1) {
                return true;
            }
        }
    }
    return false;
}


function extractCopyBoolFilename(str: string) {
    let getFirstMatchOrDefault =
        (s: string, pattern: RegExp) => {
            const match = s.match(pattern);
            return match ? match[1] : null;
        };

    let inPos = str.toLowerCase().indexOf(" in ");
    if (inPos !== -1) {
        str = str.substr(0, inPos);
    }
    //const strl = str.toLowerCase();
    let result: string | null;
    if (/copy/i.test(str)) {

        let copyRegs: RegExp[] = [
            new RegExp(".*copy\\s*[\"'](.*)[\"'].*$", "i"),
            new RegExp(".*copy\\s*[\"'](.*)[\"']$", "i"),
            new RegExp(".*copy\\s*[\"'](.*)[\"']\\s+suppress.*$", "i"),
            new RegExp(".*copy\\s*(.*)\\s+suppress.*$", "i"),
            new RegExp(".*copy\\s*[\"'](.*)[\"']\\s+replacing.*$", "i"),
            new RegExp(".*copy\\s*(.*)\\s+replacing.*$", "i"),
            new RegExp(".*copy\\s*(.*)$", "i"),
            new RegExp(".*copy\\s*(.*)\\s.*$", "i"),
            new RegExp(".*copy\\s*(.*)\\.$", "i")
        ];

        for (let regPos = 0; regPos < copyRegs.length; regPos++) {
            try {
                result = getFirstMatchOrDefault(str, copyRegs[regPos]);
                if (result !== null && result.length > 0) {
                    // let a= "Found ["+result+"] test "+regPos+"["+copyRegs+"]";
                    // console.log(a);
                    return result;
                }
            } catch (e) {
                /* continue */
                console.log(e);
                console.log(e.stacktrace);
            }
        }

    }

    //FIXME this could be better
    if (/exec sql include/i.test(str)) {
        try {
            return getFirstMatchOrDefault(str, /exec\\s*sql\\s*include\s(.*)\s*end-exec/);
        } catch (e) {
            /* continue */
        }
    }
    return "";
}

// only handle unc filenames
export function isNetworkPath(dir: string) {
    var isWin = process.platform === "win32";

    if (dir === undefined && dir === null) {
        return false;
    }

    if (isWin) {
        if (dir.length > 1 && dir[0] === '\\') {
            return true;
        }
    }

    return false;

}

export function isDirectPath(dir: string) {
    var isWin = process.platform === "win32";

    if (dir === undefined && dir === null) {
        return false;
    }

    if (isWin) {
        if (dir.length > 2 && dir[1] === ':') {
            return true;
        }

        if (dir.length > 1 && dir[0] === '\\') {
            return true;
        }

        return false;
    }

    if (dir.length > 1 && dir[0] === '/') {
        return true;
    }

    return false;
}

function findFileInDirectory(filename: string, filenameDir: string): string {
    if (!filename) {
        return "";
    }

    // // does the file exist?
    // if (fs.existsSync(filename)) {
    //     var itemStat = fs.statSync(filename);
    //     if (itemStat.isDirectory() === false) {
    //         return filename;
    //     }
    //     return "";
    // }

    // searching in cwd does not make sense, as it can change
    if (filenameDir === '.') {
        return "";
    }

    var fileExtension = filename.split('.').pop();
    var baseextsdir = getcopybookdirs();
    var extsdir = [...baseextsdir];
    extsdir.push(filenameDir);
    for (let extsdirpos = 0; extsdirpos < extsdir.length; extsdirpos++) {
        var extdir = extsdir[extsdirpos];

        const basefullPath = isDirectPath(extdir) ?
            path.join(extdir, filename) :
            path.join(filenameDir, extdir + path.sep + filename);

        //No extension?
        if (filename === fileExtension) {
            // search through the possible extensions
            const exts = VSCOBOLConfiguration.getExtentions();
            for (let extpos = 0; extpos < exts.length; extpos++) {
                var ext = exts[extpos];
                var possibleFile = basefullPath + (ext.length !== 0 ? "." + ext : "");

                if (isFile(possibleFile)) {
                    return possibleFile;
                }
            }
        } else {
            if (isFile(basefullPath)) {
                return basefullPath;
            }
        }
    }

    return "";
}

function findFileInDirectoryOrWorkspace(filename: string, filenameDir: string): string {
    if (!filename) {
        return "";
    }

    let isDirectPath:boolean = false;
    if (filenameDir.startsWith("/") || filenameDir.startsWith("\\")) {
        isDirectPath = true;
    }

    if (isDirectPath && filenameDir.length !== 0) {
        var foundFile = findFileInDirectory(filename, filenameDir);
        if (foundFile.length !== 0) {
            return foundFile;
        }
    }

    if (workspace.workspaceFolders) {
        for (var folder of workspace.workspaceFolders) {
            let foundFile = findFileInDirectory(filename, folder.uri.fsPath);
            if (foundFile.length !== 0) {
                return foundFile;
            }

            if (isDirectPath === false && filenameDir.length !== 0) {
                let foundFile = findFileInDirectory(filename, path.join(folder.uri.fsPath, filenameDir));
                if (foundFile.length !== 0) {
                    return foundFile;
                }

            }
        }
    }
    return "";
}

export function expandLogicalCopyBookToFilenameOrEmpty(filename: string, inDirectory: string): string {
    let fullPath = "";

    try {
        fullPath = findFileInDirectoryOrWorkspace(filename, inDirectory);
        if (fullPath.length !== 0) {
            return path.normalize(fullPath);
        }

        let lastDot = filename.lastIndexOf(".");
        if (lastDot !== -1) {
            let filenameNoExtension = filename.substr(0, lastDot);
            fullPath = findFileInDirectoryOrWorkspace(filenameNoExtension, inDirectory);
            if (fullPath.length !== 0) {
                return path.normalize(fullPath);
            }
        }
    }
    catch (ex) {
        logException("expandLogicalCopyBookToFilenameOrEmpty", ex);
    }

    return "";
}

export function provideDefinition(doc: TextDocument, pos: Position, ct: CancellationToken): ProviderResult<Definition> {

    const line = doc.lineAt(pos);
    const text = line.text;
    const filename = extractCopyBoolFilename(text);
    const inPos = text.toLowerCase().indexOf("in");

    let inDirectory = inPos !== -1 ? text.substr(2+inPos) : "";

    if (inDirectory.length !== 0) {
        let inDirItems = inDirectory.trim();

        if (inDirItems.endsWith(".")) {
            inDirItems = inDirItems.substr(0, inDirItems.length-1);
        }

        if (inDirItems.endsWith("\"") && inDirItems.startsWith("\"")) {
            inDirItems = inDirItems.substr(1, inDirItems.length-2);
        }

        if (inDirItems.endsWith("'") && inDirItems.startsWith("'")) {
            inDirItems = inDirItems.substr(1, inDirItems.length-2);
        }

        inDirectory = inDirItems;
    }

    if (filename !== null && filename.length !== 0) {
        const fullPath = expandLogicalCopyBookToFilenameOrEmpty(filename.trim(), inDirectory);
        if (fullPath.length !== 0) {
            return new vscode.Location(
                Uri.file(fullPath),
                new Range(new Position(0, 0), new Position(0, 0))
            );
        }
    }

    return;
}
