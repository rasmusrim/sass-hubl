# SASS + HubL
## Background
HubSpot does not support SASS and SAS does not support HubL. This is an extension to the sass tool in node that will preserve HubL code.

## Usage
Run `sass-compile.js` with the SCSS file you would like to compile as the first argument.

    node sass-compile.js src/css/button.scss

The script will create a CSS-file with only the file extension changed at the same location as the SCSS file.  

## Under the hood
All HubL code is enclosed it `{{ }}` or `{% %}`. The first thing this compiler does, is find all instances of HubL code.

When it has found something, it converts it to something that SASS will accept. Ie. it converts it into valid SASS by using a hubspot function called `hubspotPlaceholder` (which does not really exist. It is only there to make the SASS valid). It looks like this: 

    hublPlaceholder('<the original HubL content base64 encoded>')

So, for example this SASS:

    background: url({{ get_asset_url('../images/logo-small.svg') }}) no-repeat;

Will be converted to:
    
    background: url(hubspotPlaceholder('e3sgZ2V0X2Fzc2V0X3VybCgnLi4vaW1hZ2VzL2xvZ28tc21hbGwuc3ZnJykgfX0=')) no-repeat;

HubL code which is not inside a selector, for example includes, wioll be wrapped in a dummy selector. This SASS:

    {% include './_header.css' %}

...will be converted to this:

    .hubspot { 
        hublProperty: hublPlaceholder('e3sgZ2V0X2Fzc2V0X3VybCgnLi4vaW1hZ2VzL2xvZ28tc21hbGwuc3ZnJykgfX0='); 
    }

After SASS has been succesfully compiled, the resulting CSS will bec converted back by using the base64 encoded string. 