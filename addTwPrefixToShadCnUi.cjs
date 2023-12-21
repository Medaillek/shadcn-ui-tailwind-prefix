const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Prefix to update
const prefix = 'tw-';

// Update your component directory path
transformDirectory('./components/ui');
const prefixedClass = addPrefix("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70")
console.log(prefixedClass)





// Regex pour trouver les classes Tailwind

const classNamesRegex = /(?<=className=.*?\s*["'`])([\w\d:a-zA-Z0-9-\]\[\s\%\=\/.&>\(\)]*)(?=\s*["'`])/gm
const conditionnalClassNamesRegex = /(?<=&&\s*["'`])([\w\d:a-zA-Z0-9-\]\[\s\%\=\/.&>\(\)]*)(?=.*["'`])/gm


// Fonction pour ajouter le préfixe à une classe
function addPrefix(classNameMatch) {
  const classNames = classNameMatch.replace(/\s+/, ' ').split(/\s/gm)

  let finalClassNames = ''
  for (const className of classNames) {
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
  return content.replace(classNamesRegex, addPrefix).replace(conditionnalClassNamesRegex, addPrefix)
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

