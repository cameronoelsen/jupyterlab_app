
import {
    PageConfig
} from '@jupyterlab/coreutils';

import 'font-awesome/css/font-awesome.min.css';
import '@jupyterlab/theming/style/index.css';
import './css/main.css'

import {
    ElectronJupyterLab as app
} from './electron-extension';

import {
    JupyterAppChannels as Channels
} from '../ipc';

import {
    SplashScreen
} from './electron-launcher';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

let ipcRenderer = (window as any).require('electron').ipcRenderer;
import extensions from './extensions'

function main() : void {
    let version : string = PageConfig.getOption('appVersion') || 'unknown';
    let name : string = PageConfig.getOption('appName') || 'JupyterLab';
    let namespace : string = PageConfig.getOption('appNamespace') || 'jupyterlab';
    let devMode : string  = PageConfig.getOption('devMode') || 'false';
    let settingsDir : string = PageConfig.getOption('settingsDir') || '';
    let assetsDir : string = PageConfig.getOption('assetsDir') || '';
    let labReady = false;
    
    if (version[0] === 'v') {
        version = version.slice(1);
    }

    function iterationDone() {
        return !labReady;
    }

    ReactDOM.render(
        <SplashScreen iterationDone={iterationDone} />,
        document.getElementById('root')
    );

    let lab = new app({
        namespace: namespace,
        name: name,
        version: version,
        devMode: devMode.toLowerCase() === 'true',
        settingsDir: settingsDir,
        assetsDir: assetsDir,
        mimeExtensions: extensions.mime
    });

    try {
        lab.registerPluginModules(extensions.jupyterlab);
    } catch (e) {
        console.error(e);
    }
    
    // Ignore Plugins
    let ignorePlugins : string[] = [];
    try {
        let option = PageConfig.getOption('ignorePlugins');
        ignorePlugins = JSON.parse(option);
    } catch (e) {
        // No-op
    }

    // Get token from server
    ipcRenderer.on(Channels.SERVER_DATA, (event: any, data: any) => {
        // Set token
        PageConfig.setOption("token", data.token);
        // Set baseUrl
        PageConfig.setOption("baseUrl", data.baseUrl);
        // Start lab and fade splash
        labReady = true;
        try{
            lab.start({ "ignorePlugins": ignorePlugins });
        }
        catch (e){
            console.log(e);
        }
    });
    ipcRenderer.send(Channels.RENDER_PROCESS_READY);
}

window.onload = main;
