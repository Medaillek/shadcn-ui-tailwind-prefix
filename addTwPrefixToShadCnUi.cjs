const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Préfixe à ajouter
const prefix = 'tw-';

// transformDirectory('./components/ui');
/* const prefixedClass = addPrefix('z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2')
console.log(prefixedClass) */


// Regex pour trouver les classes Tailwind

const classNamesRegex = /((?<=className=.*\n*\s*["'`])|(?<=cva\(.*\n*\s*["'`])|(?<=&&.*\n*\s*["'`]))([\w\n\d\s\:\&\-\_\[\]~\.=\/\(\)%\>]*)(?=\s*["'`])/gm
/* const conditionnalClassNamesRegex = /(?<=&&\s*["'`])([\w\d:a-zA-Z0-9-\]\[\s\%\=\/.&>\(\)]*)(?=.*["'`])/gm
 */

// Fonction pour ajouter le préfixe à une classe
function addPrefix(classNameMatch) {
  const classNames = classNameMatch.replace(/\s+/, ' ').split(/\s/gm)

  let finalClassNames = ''
  for (const rawClassName of classNames) {
    const className = rawClassName.trim();
    if (className === 'sr-only' || className === 'not-sr-only') {
      finalClassNames += `${className} `;
      continue;
    }
    if (className.startsWith(prefix) || className.startsWith('-' + prefix)) {
      finalClassNames += `${className} `;
      continue;
    }

    const isDoublePoint = className.indexOf(':')
    let updatedClassName = className
    //means its a hover: or focus: or custom selector : [&:has([role=checkbox])]:pr-0
    if (isDoublePoint !== -1) {
      const lastDoublePoint = className.lastIndexOf(':')
      const currentCls = className.slice(lastDoublePoint + 1)
      const prefixCls = className.slice(0, lastDoublePoint + 1)
      if (currentCls.includes(prefix)) {
        finalClassNames += `${className} `;
        continue;
      }
      if (currentCls.startsWith('-')) {
        finalClassNames += `${prefixCls}-${prefix}${currentCls.slice(1)} `;
      } else {
        finalClassNames += `${prefixCls}${prefix}${currentCls} `;
      }
      continue
    }
    if (className.startsWith('-')) {
      finalClassNames += `-${prefix}${updatedClassName.slice(1)} `;
    } else {
      finalClassNames += `${prefix}${updatedClassName} `;
    }
  }
  return finalClassNames.trim();
}

function applyRegexOnString(content) {
  return content.replace(classNamesRegex, addPrefix)
}


// Fonction pour transformer les classes dans un fichier
function transformFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = applyRegexOnString(content);
  fs.writeFileSync(filePath, newContent);
}

// Fonction pour transformer les classes dans tous les fichiers d'un répertoire
function transformDirectory(dirPath) {
  const filePaths = glob.sync(path.join(dirPath, '**/*.tsx'));
  filePaths.forEach(transformFile);
}

// Utilisez cette fonction pour transformer les classes dans tous les fichiers de vos composants

const readline = require('node:readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});
readline.question(`File name : `, name => {
  const file = path.join(process.cwd(), `./components/ui/${name}.tsx`);
  transformFile(file)
  readline.close();
});
