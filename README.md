# COBOL Source colouriser for Visual Studio Code

[![Version](https://vsmarketplacebadge.apphb.com/version/bitlang.cobol.svg)](https://marketplace.visualstudio.com/items?itemName=bitlang.cobol) [![Installs](https://vsmarketplacebadge.apphb.com/installs-short/bitlang.cobol.svg)](https://marketplace.visualstudio.com/items?itemName=bitlang.cobol) [![Downloads](https://vsmarketplacebadge.apphb.com/downloads-short/bitlang.cobol.svg)](https://marketplace.visualstudio.com/items?itemName=bitlang.cobol) [![Rating](https://vsmarketplacebadge.apphb.com/rating-star/bitlang.cobol.svg)](https://marketplace.visualstudio.com/items?itemName=bitlang.cobol) [![chat-img](https://img.shields.io/badge/Gitter-Join_the_vscode_cobol_chat-brightgreen.svg)](https://gitter.im/vscode_cobol/community)
--------------

## What is this?
Syntax highlighting for COBOL, JCL, PL/I and MF directive files.

## What is this not?
An Integrated Development Environment for COBOL.

## What is it useful for?
Quick viewing of COBOL source and edit.

## What platform can it be used on?
Everywhere Visual Studio Code works.. aka Windows, Linux and Mac OSX.

## Code colourisation for COBOL, PL/I and JCL:
 ![sieve_jcl](https://raw.githubusercontent.com/spgennard/vscode_cobol/master/images/screenshot_three.png)

## IntelliSense example:
![perform_add](https://raw.githubusercontent.com/spgennard/vscode_cobol/master/images/perform_add.gif)

## Breadcrumb support:
![breadcrumbs](https://raw.githubusercontent.com/spgennard/vscode_cobol/master/images/breadcrumb.png)

## Outline support:
![outline](https://raw.githubusercontent.com/spgennard/vscode_cobol/master/images/outline.png)

## Goto definition:
![gotodef](https://raw.githubusercontent.com/spgennard/vscode_cobol/master/images/gotodef.gif)

## Peek definition:
![peekdef](https://raw.githubusercontent.com/spgennard/vscode_cobol/master/images/peekdef.gif)

## Keybinds

| Keys                     |                          Description                           |
|--------------------------|:--------------------------------------------------------------:|
| ctrl+alt+p               |                    Goto procedure division                     |
| ctrl+alt+w               |                  Goto working-storage section                  |
| ctrl+alt+d               | Goto data division (or working-storage section if not present) |
| ctrl+alt+,               |             Go backwards to next section/division              |
| ctrl+alt+.               |            Go forward to next next section/division            |
| f12 or ctrl+click        |                     Move to copybook/file                      |
| ctrl+hover over copybook |                     Peek head of copybook                      |
| right mouse/peek         |            Peek copybook without opening the file)             |

## Settings

- COBOL tab stops can be changed by editing the *coboleditor.tabstops* setting.
- Extensions used for *move to copybook*, can be changed by editting the *coboleditor.copybookexts* settings.
- Directories used for *move to copybook*, can be changed by editting the *coboleditor.copybookdirs* settings.

## Tasks

Visual Studio code can be setup to build your COBOL source code.

### Task: Using MsBuild

MsBuild based projects can be consumed as build task, allowing navigation to error/warnings when they occur.

Below is an example of *build* task that uses *mycobolproject.sln*.

```json
{
    "version": "2.0.0",
    "tasks": [ {
            "label": "build",
            "type": "shell",
            "command": "msbuild",
            "args": [
                "/property:GenerateFullPaths=true",
                "/t:build",
                "mycobolproject.sln"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "presentation": {
                "reveal": "always"
            },
            "problemMatcher": "$mfcobol-msbuild"
        }
    ]
}
```

### Task: Single file compile using Micro Focus COBOL - ERRFORMAT(3)

The example below shows you how you can create a single task to compile one program using the `cobol` command.

```json
{
    "label": "mf cobol (single file)",
    "command": "cobol",
    "args": [
        "${file}",
        "noint",
        "nognt",
        "noobj",
        "noquery",
        "errformat(3)",
        "COPYPATH($COBCPY;${workspaceFolder}\\CopyBooks;${workspaceFolder}\\CopyBooks\\Public)",
        ";"
    ],
    "group": {
        "kind": "build",
        "isDefault": true
    },
    "options": {
        "cwd": "${workspaceRoot}"
    },
    "presentation": {
        "echo": true,
        "reveal": "never",
        "focus": true,
        "panel": "dedicated"
    },
    "problemMatcher": "$mfcobol-errformat3"
}
```

### Task: Single file compile using Micro Focus COBOL - ERRFORMAT(2)

The example below shows you how you can create a single task to compile one program using the `cobol` command.

For Net Express/Server Express compilers use the "$mfcobol-errformat2-netx-sx" problem matcher as although the directive ERRFORMAT"2" is used, the compiler output error format is slightly different.


```json
{
    "label": "mf cobol (single file)",
    "command": "cobol",
    "args": [
        "${file}",
        "noint",
        "nognt",
        "noobj",
        "noquery",
        "errformat(2)",
        "COPYPATH($COBCPY;${workspaceFolder}\\CopyBooks;${workspaceFolder}\\CopyBooks\\Public)",
        ";"
    ],
    "group": {
        "kind": "build",
        "isDefault": true
    },
    "options": {
        "cwd": "${workspaceRoot}"
    },
    "presentation": {
        "echo": true,
        "reveal": "never",
        "focus": true,
        "panel": "dedicated"
    },
    "problemMatcher": [ "$mfcobol-errformat2", "$mfcobol-errformat2-copybook" ]
}
```

### Task: Single file compile using GnuCOBOL/OpenCOBOL/COBOL-IT

The example below shows you how you can create a single task to compile one program using the `cobc` command.

This example is for GnuCOBOL 1-2.x, for GnuCOBOL use $gnucobol3-cob


```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "gnucobol - cobc (single file)",
            "type": "shell",
            "command": "cobc",
            "args": [
                "-fsyntax-only",
                "-I${workspaceFolder}\\CopyBooks",
                "-I${workspaceFolder}\\CopyBooks\\Public",
                "${file}"
            ],
            "problemMatcher" : "$gnucobol-cobc"
        }
    ]
}
```


### Task: Single file compile using ACUCOBOL-GT

The example below shows you how you can create a single task to compile one program using the `ccbl32` command.
```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "acu cobol - ccbl32 (single file)",
            "type": "shell",
            "command": "%ACUCOBOL%\\bin\\ccbl32",
            "args": [
                "-Sp", "${workspaceFolder}\\CopyBooks",
                "-Sp", "${workspaceFolder}\\CopyBooks\\Public",
                "${file}"
            ],
            "windows": {
                "options": {
                    "env": {
                        "ACUCOBOL" : "C:\\extend10.1.1\\AcuGT"
                    }
                }
            },
            "problemMatcher" : [ "$acucobol-warning-ccbl", "$acucobol-ccbl" ]
        }
    ]
}
```

### Task: Breakdown of problem matchers

| Product and Version                           | Tools                                                        | Problem matcher(s)                          |
|-----------------------------------------------|--------------------------------------------------------------|---------------------------------------------|
| COBOL-IT                                      | cobc                                                         | $cobolit-cobc                               |
| COBOL-IT                                      | cobc                                                         | $cobolit-warning-cobc + $cobolit-error-cobc |
| open-cobol 1-1.5                              | cobc                                                         | $opencobol-cobc                             |
| ACU-COBOLGT                                   | ccbl                                                         | $acucobol-ccbl + $acucobol-warning-ccbl     |
| GnuCOBOL 1-2                                  | cobc                                                         | $gnucobol-cobc                              |
| GnuCOBOL 3                                    | cobc                                                         | $gnucobol3-cobc                             |
| Micro Focus COBOL Net Express/Server Express  | cob or cobol.exe                                             | $mfcobol-errformat2-netx-sx                 |
| Micro Focus Visual COBOL/Enterprise Developer | msbuild                                                      | $mfcobol-msbuild                            |
|                                               | cob or cobol.exe + ERRFORMAT"3"                              | $mfcobol-errformat3                         |
|                                               | cob or cobol.exe + ERRFORMAT"3" / filename extract with PATH | $mfcobol-errformat3-basefn                  |
|                                               | cob or cobol.exe + ERRFORMAT"2" | $$mfcobol-errformat2               |
|                                               | cob or cobol.exe + ERRFORMAT"2" for errors in copybooks       | $$mfcobol-errformat2-copybook               |


## Complementary extensions

### [ToDo tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree) by Gruntfuggly

Although this extension does not understand comments in COBOL source files, it can be made to by adding the following user setting:

```json
{
    "todo-tree.flat": false,
    "todo-tree.expanded": true,

    "todo-tree.regex": "((//|#|<!--|;|/\\*|\\*>|^......\\*)\\s*($TAGS)|^\\s*- \\[ \\])",
    "todo-tree.tags": [
        "TODO",
        "FIXME",
        "!FIXME",
        "CHANGED",
        "BUG",
        "NOTE"
    ],
    "todo-tree.filterCaseSensitive": true,

    "todo-tree.iconColours": {
        "FIXME" : "#A188FF",
        "!FIXME" : "red",
        "NOTE" : "blue",
        "TODO" : "cyan",
        "CHANGED" : "yellow",
        "BUG" : "red"
    }
}
```


## coboleditor.fileformat

When ```coboleditor.margin``` is enabled extension will look for "sourceformat" settings in the header of the source file itself.

However, if you need to tell the extension which file are which particular format, this can be achieved with ```coboleditor.fileformat``` property.

For example, if you want all the files that match ```A*.cbl``` to be fixed and every other *.cbl is free format, you can then use:

```json
    "coboleditor.fileformat": [
        {
            "pattern": "**/A*.cbl",
            "sourceformat": "fixed"
        },
        {
            "pattern": "**/*.cbl",
            "sourceformat": "free"
        }
    ],
```

## Handling code pages

The defaults embedded in the extension can be overwritten by either changing sessions at the user level in the settings json or more efficiently, you change it just for the "COBOL" files.

For example, to ensure you use utf8 for all you files use:

```json
{
    "[COBOL]": {
        "files.encoding": "utf8",
        "files.autoGuessEncoding": false
    }
}
```

## coboleditor.experimential_features

Currently I have only one is active experimential feature and this is "hover" support for known APIs.

This currently includes most of the *Micro Focus COBOL Library API* (CBL_) and a subset of ILE date apis.

This can be activated by setting the flag coboleditor.experimential_features in the settings panel.

and looks like:

 ![hover](https://raw.githubusercontent.com/spgennard/vscode_cobol/master/images/hover.png)

## Online resources

- [Facebook COBOL Group](https://www.facebook.com/groups/COBOLProgrammers/)
- [Micro Focus COBOL Community](https://community.microfocus.com/t5/Application-Modernization/ct-p/COBOL)

## Shortcuts


 - [ALT] + [SHIFT] + [C]: Change to COBOL Syntax (default)
 - [ALT] + [SHIFT] + [A]: Change to ACUCOBOL-GT Syntax
 - [ALT] + [SHIFT] + [O]: Change to OpenCOBOL Syntax
 - [ALT] + [SHIFT] + [G]: Change to GnuCOBOL Syntax
 - [ALT] + [SHIFT] + [M]: Toggle margins (overrides user/workspace settings)

## Contributors

I would like to thank the follow contributors for providing patches, fixes, kind words of wisdom and enhancements.

 - Ted John of Berkshire, UK
 - Kevin Abel of Lincoln, NE, USA
 - Simon Sobisch of Germany
