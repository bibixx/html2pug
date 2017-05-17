function updatePug() {
  const quotesInput = document.querySelector( 'input#quotes' );
  const tabSizeInput = document.querySelector( 'select#tab-size' );
  let tabSize = "  ";

  switch ( tabSizeInput.value ) {
    case "2 spaces":
      tabSize = "  ";
      break;
    case "4 spaces":
      tabSize = "    ";
      break;
    case "tab":
      tabSize = "	";
      break;
  }

  const html2pugOptions = {
    quotes: ( quotesInput.checked ) ? "double" : "single",
    spaces: tabSize,
  }

  pugCM.setValue( html2pug( htmlCM.getValue(), html2pugOptions ).join( "\n" ) );
}

const options = {
  theme: "material",
  lineNumbers: true,
  styleActiveLine: true,
  matchBrackets: true,
  styleActiveLine: true,
  viewportMargin: Infinity
}

document.querySelector( 'input#quotes' ).addEventListener( "change", updatePug );
document.querySelector( 'select#tab-size' ).addEventListener( "change", updatePug );

const htmlCM = CodeMirror( document.getElementById( "html" ), Object.assign( {
  value: "<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"utf-8\">\n    <title>Hello</title>\n  </head>\n  <body>\n    <p class=\"test\" id=\"asd\">Hello World!</p>\n  </body>\n</html>",
  mode: "text/html",
}, options ) );

const pugCM = CodeMirror( document.getElementById( "pug" ), Object.assign( {
  value: "",
  mode: { name: "pug", alignCDATA: true },
  readOnly: true,
}, options ) );

htmlCM.on( "change", updatePug )
updatePug();

let timer = null;
const snackbar = document.querySelector( ".snackbar" );
function hideSnackbar() {
  snackbar.classList.remove( "snackbar--active" );
}

snackbar.addEventListener( "click", () => {
  clearTimeout( timer );
  hideSnackbar();
} );


const clipboard = new Clipboard( '.copy', {
  text: () => {
    return pugCM.getValue();
  }
} );

clipboard.on('success', () => {
  snackbar.classList.add( "snackbar--active" );
  snackbar.innerHTML = "Copied to clipboard.";
  timer = setTimeout( hideSnackbar, 2000 );
});

clipboard.on('error', () => {
  snackbar.classList.add( "snackbar--active" );
  snackbar.innerHTML = "Error occured while copying to clipboard.";
  timer = setTimeout( hideSnackbar, 2000 );
});
