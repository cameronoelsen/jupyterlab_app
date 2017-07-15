// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    PageConfig
} from '@jupyterlab/coreutils';

import {
    ElectronJupyterLab
} from './electron-extension';

import {
    JupyterAppChannels as Channels
} from '../ipc';

import {
    SplashScreen, ServerManager
} from './electron-launcher';

import * as React from 'react';
import extensions from './extensions';

/**
 * Use window.require to prevent webpack
 * from trying to resolve the electron library
 */
let ipcRenderer = (window as any).require('electron').ipcRenderer;


export 
namespace Application {
    export
    interface Props {

    }

    export
    interface State {
        renderState: () => any;
    }
}

export
class Application extends React.Component<Application.Props, Application.State> {
    
    private lab: ElectronJupyterLab;

    private ignorePlugins: string[];

    constructor(props: Application.Props) {
        super(props);
        this.state = {renderState: this.renderLauncher};
        this.setupLab();

        /* Setup server data response handler */
        ipcRenderer.on(Channels.SERVER_DATA, (event: any, data: any) => {
            PageConfig.setOption("token", data.token);
            PageConfig.setOption("baseUrl", data.baseUrl);
            try{
                this.lab.start({ "ignorePlugins": this.ignorePlugins});
            }
            catch (e){
                console.log(e);
            }
            (this.refs.splash as SplashScreen).fadeSplashScreen();
        });
    }

    private setupLab(): void {
        let version : string = PageConfig.getOption('appVersion') || 'unknown';
        let name : string = PageConfig.getOption('appName') || 'JupyterLab';
        let namespace : string = PageConfig.getOption('appNamespace') || 'jupyterlab';
        let devMode : string  = PageConfig.getOption('devMode') || 'false';
        let settingsDir : string = PageConfig.getOption('settingsDir') || '';
        let assetsDir : string = PageConfig.getOption('assetsDir') || '';
        
        if (version[0] === 'v') {
            version = version.slice(1);
        }

        this.lab = new ElectronJupyterLab({
            namespace: namespace,
            name: name,
            version: version,
            devMode: devMode.toLowerCase() === 'true',
            settingsDir: settingsDir,
            assetsDir: assetsDir,
            mimeExtensions: extensions.mime
        });

        try {
            this.lab.registerPluginModules(extensions.jupyterlab);
        } catch (e) {
            console.error(e);
        }
        
        // Ignore Plugins
        this.ignorePlugins = [];
        try {
            let option = PageConfig.getOption('ignorePlugins');
            this.ignorePlugins = JSON.parse(option);
        } catch (e) {
            // No-op
        }
    }

    private renderLauncher(): any {
        let serverSelected = (server: ServerManager.Connection) => {
            this.setState({renderState: this.renderSplash});
        }

        return <ServerManager serverSelected={serverSelected} />;
    }

    private renderSplash() {
        /* Request Jupyter server data from main process, then render
         * splash screen
         */
        ipcRenderer.send(Channels.RENDER_PROCESS_READY);
        return (
            <SplashScreen  ref='splash' finished={() => {
                this.setState({renderState: this.renderLab});}
            } />
        );
    }

    private renderLab(): any {
        return null;
    }

    render() {
        return this.state.renderState.call(this);
    }
}