function html2pug( htmlString, userOptions = {} ) {
  const PROTECTION = ( String.fromCharCode( Math.floor( Math.random() * ( 122 - 97 ) ) + 97 ) + ( Math.random()*1e32 ).toString( 36 ) ).toUpperCase();
  const lines = [];

  const options = Object.assign( {
    spaces: "  ",
    quotes: "double",
  }, ( userOptions !== null && typeof userOptions === "object" ) ? userOptions : {} );

  const drawChildren = ( parent, level = -1 ) => {
    // console.log( parent );
    let elString = "";
    const spaces = Array( level + 1 ).join( options.spaces );

    if ( parent.nodeName === "#text" ) {
      if ( !/^\s+$/.test( parent.data ) ) {
        parent.data.replace( /^\s*/, "" ).split( "\n" ).forEach( ( v ) => {
          lines.push( spaces + "| " + v );
        } );
        // lines.push( spaces + "| " + parent.data.replace( /^\s*/, "" ).split( "\n" ).join( "\n" + spaces + "| " ) );
      }
    } else if ( parent.nodeName === "#comment" ) {
      if ( /\n/.test( parent.data ) ) {
        lines.push( spaces + "//" );
        lines.push( spaces + options.spaces + parent.data.replace( /^\s*/, "" ).replace( /\n/, "\n" + spaces + options.spaces ) );
      } else {
        lines.push( spaces + "// " + parent.data.replace( /^\s*/, "" ) );
      }
    } else if ( parent.nodeName !== PROTECTION ) {
      let nodeName = parent.nodeName.replace( PROTECTION, "" ).toLowerCase();

      elString += spaces + nodeName + drawAttributes( parent );

      if ( parent.childNodes.length !== 1 ) {
        lines.push( elString );
      }
    }

    if ( parent.childNodes.length === 1 ) {
      elString += " " + parent.childNodes[ 0 ].data;
      lines.push( elString );
    } else if ( parent.childNodes.length > 1 ) {
      for ( let i = 0; i < parent.childNodes.length; i++ ) {
        const child = parent.childNodes[ i ]
        drawChildren( child, level + 1 );
      }
    }
  }

  const drawAttributes = ( el ) => {
    const attrArr = [];
    const quotes = ( options.quotes === "single" ) ? "'" : "\"";
    let id = "";
    let classList = [];
    for ( let x = 0; x < el.attributes.length; x++ ) {
      const attr = el.attributes[ x ];
      if ( attr.name !== "id" && attr.name !== "class" ) {
        const boolAttrs = [ "checked", "selected", "disabled", "readonly", "multiple", "ismap", "defer", "declare", "noresize", "compact" ];
        if ( boolAttrs.indexOf( attr.name.toLowerCase() ) >= 0 ) {
          attrArr.push( `${attr.name}` );
        } else {
          attrArr.push( `${attr.name}=${quotes}${attr.value}${quotes}` );
        }
      } else if ( attr.name === "id" ) {
        id = attr.value;
      } else if ( attr.name === "class" ) {
        for ( let i = 0; i < el.classList.length; i++ ) {
          classList.push( el.classList[ i ] );
        }
      }
    }

    return ( ( id !== "" ) ? `#${id}` : "" ) + ( ( classList.length > 0 ) ? `.${classList.join( "." )}` : "" ) + ( ( attrArr.length > 0 ) ? `(${attrArr.join( " " )})` : "" );
  }

  const drawDoctype = ( html ) => {
    const doctype = html.match( /<\!DOCTYPE\s*([^]+?)>/mi );
    if ( !doctype ) {
      return;
    }

    let doctypePug = "";

    switch ( doctype[ 0 ].toLowerCase() ) {
      case '<!doctype html>':
        doctypePug = "doctype html";
        break;
      case '<!doctype html public "-//w3c//dtd xhtml 1.0 transitional//en" "http://www.w3.org/tr/xhtml1/dtd/xhtml1-transitional.dtd">':
        doctypePug = "doctype transitional";
        break;
      case '<!doctype html public "-//w3c//dtd xhtml 1.0 strict//en" "http://www.w3.org/tr/xhtml1/dtd/xhtml1-strict.dtd">':
        doctypePug = "doctype strict";
        break;
      case '<!doctype html public "-//w3c//dtd xhtml 1.0 frameset//en" "http://www.w3.org/tr/xhtml1/dtd/xhtml1-frameset.dtd">':
        doctypePug = "doctype frameset";
        break;
      case '<!doctype html public "-//w3c//dtd xhtml 1.1//en" "http://www.w3.org/tr/xhtml11/dtd/xhtml11.dtd">':
        doctypePug = "doctype 1.1";
        break;
      case '<!doctype html public "-//w3c//dtd xhtml basic 1.1//en" "http://www.w3.org/tr/xhtml-basic/xhtml-basic11.dtd">':
        doctypePug = "doctype basic";
        break;
      case '<!doctype html public "-//wapforum//dtd xhtml mobile 1.2//en" "http://www.openmobilealliance.org/tech/dtd/xhtml-mobile12.dtd">':
        doctypePug = "doctype mobile";
        break;
      case '<!doctype plist public "-//apple//dtd plist 1.0//en" "http://www.apple.com/dtds/propertylist-1.0.dtd">':
        doctypePug = "doctype plist";
        break;
      default:
        doctypePug = "doctype " + doctype[ 1 ];
    }

    if ( doctypePug !== "" ) {
      lines.push( doctypePug );
    }
  }

  htmlString = htmlString.replace( /<(\/?)(html|head|body)>/g, "<$1$2" + PROTECTION + ">" );

  const root = document.createElement( PROTECTION );
  root.innerHTML = htmlString;

  drawDoctype( htmlString );
  drawChildren( root );

  return lines;
}
