// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    JupyterLabWindow
} from 'jupyterlab_app/src/main/window';

import {
    remote, Browser, ipcRenderer
} from 'jupyterlab_app/src/browser/utils';

import {
    JupyterApplicationIPC as AppIPC,
    JupyterWindowIPC as WindowIPC
} from 'jupyterlab_app/src/ipc';

import * as React from 'react';

export namespace TitleBar {
    export
    interface Props {
        uiState: JupyterLabWindow.UIState;
    }
    
    export
    interface State {
        titleBarSize: number;
        maxButtonState: MaxButtonState;
    }

    export
    type MaxButtonState = 'restore' | 'max';
}

export
class TitleBar extends React.Component<TitleBar.Props, TitleBar.State> {
    
    constructor (props: TitleBar.Props) {
        super(props);

        let maxButtonState = 'max';
        if (remote.getCurrentWindow().isMaximized()) {
            maxButtonState = 'restore';
        }

        this.state = {
            titleBarSize: Browser.getTopPanelSize(),
            maxButtonState: maxButtonState as TitleBar.MaxButtonState
        };

        this._handleZoom = this._handleZoom.bind(this);
        this._handleMaximize = this._handleMaximize.bind(this);
        this._handleUnmaximize = this._handleUnmaximize.bind(this);

        ipcRenderer.on(AppIPC.POST_ZOOM_EVENT, this._handleZoom);
        ipcRenderer.on(WindowIPC.POST_MAXIMIZE_EVENT, this._handleMaximize);
        ipcRenderer.on(WindowIPC.POST_UNMAXIMIZE_EVENT, this._handleUnmaximize);
    }

    componentWillUnmount() {
        ipcRenderer.removeListener(AppIPC.POST_ZOOM_EVENT, this._handleZoom);
        ipcRenderer.removeListener(WindowIPC.POST_MAXIMIZE_EVENT, this._handleMaximize);
        ipcRenderer.removeListener(WindowIPC.POST_UNMAXIMIZE_EVENT, this._handleUnmaximize);
    }

    render () {
        let modClass = 'jpe-mod-' + this.props.uiState;

        let style: any = {height: null, minHeight: null};
        if (this.props.uiState == 'mac') {
            style.minHeight = style.height = this.state.titleBarSize;
        }
        
        // Don't return title bar content on linux and max
        if (this.props.uiState == 'linux' || this.props.uiState == 'mac') {
            return (
                <div className={'jpe-TitleBar-body ' + modClass} style={style} />
            );
        }

        let clicked = (type: string) => {
            let window = remote.getCurrentWindow();
            if (type == 'close') {
                window.close();
            } else if (type == 'minimize') {
                window.minimize();
            } else {
                if (this.state.maxButtonState == 'restore')
                    window.unmaximize();
                else
                    window.maximize();
            }
        }

        return (
            <div className={'jpe-TitleBar-body ' + modClass} style={style}>
                <div className={'jpe-TitleBar-button-container ' + modClass}>
                    <div className={'jpe-TitleBar-button jpe-TitleBar-close ' + modClass} onClick={() => {clicked('close')}} />
                    <div className={'jpe-TitleBar-button jpe-TitleBar-' + this.state.maxButtonState + ' ' + modClass} onClick={() => {clicked('maximize')}} />
                    <div className={'jpe-TitleBar-button jpe-TitleBar-min ' + modClass} onClick={() => {clicked('minimize')}} />
                </div>
            </div>
        );
    }

    private _handleZoom() {
        this.setState({titleBarSize: Browser.getTopPanelSize()});
    }
    
    private _handleMaximize() {
        this.setState({maxButtonState: 'restore'});
    }
    
    private _handleUnmaximize() {
        this.setState({maxButtonState: 'max'});
    }
}
