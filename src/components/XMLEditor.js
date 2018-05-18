import React, {Component} from 'react';
import CodeMirror from 'codemirror';
import xml2JSON from 'xml-js';
import vkbeautify from 'vkbeautify';
import $ from 'jquery';
import xml from 'codemirror/mode/xml/xml';
import fold from 'codemirror/addon/fold/foldcode';
import xmlfold from 'codemirror/addon/fold/xml-fold';
import foldgutter from 'codemirror/addon/fold/foldgutter';
import braceFold from 'codemirror/addon/fold/brace-fold';
import indentFold from 'codemirror/addon/fold/indent-fold';
import js from 'codemirror/mode/javascript/javascript';


if (!xml) {
    console.log(xml, fold, xmlfold, foldgutter, js, braceFold, indentFold);
}

class XMLEditor extends Component {

    constructor() {
        super();
        this.state = {showJSONFormatBtn: false, showJSONCompactBtn: false, selectedFileType: 'XML'}
    }

    componentDidMount() {
        this.sourceEditor = this.createCodeMirrorEditor('xml', 'xmlTextArea', '');
        this.sourceEditor.foldCode(CodeMirror.Pos(13, 0));
    }

    formatSource = () => {
        try {
            if (this.state.selectedFileType === 'XML') {
                this.sourceEditor.setValue(vkbeautify.xml(this.sourceEditor.getValue()));
            } else {
                this.sourceEditor.setValue(vkbeautify.json(this.sourceEditor.getValue()));
            }
        } catch (e) {
            console.log("Invalid format", e);
            this.setState({errorMessage: e.message});
        }

    }
    compactSource = () => {
        try {
            if (this.state.selectedFileType === 'XML') {
                this.sourceEditor.setValue(vkbeautify.xmlmin(this.sourceEditor.getValue(), true));
            } else {
                this.sourceEditor.setValue(vkbeautify.jsonmin(this.sourceEditor.getValue(), true));
            }
        } catch (e) {
            console.log("Invalid format", e);
            this.setState({errorMessage: e.message});
        }
    }
    formatPreview = () => {
        try {
            if (this.state.selectedFileType === 'XML') {
                this.targetEditor.setValue(vkbeautify.json(this.targetEditor.getValue()));
            } else {
                this.targetEditor.setValue(vkbeautify.xml(this.targetEditor.getValue()));
            }
        } catch (e) {
            console.log("Invalid format", e);
            this.setState({errorMessage: e.message});
        }
    }
    compactPreview = () => {
        try {
            if (this.state.selectedFileType === 'XML') {
                this.targetEditor.setValue(vkbeautify.jsonmin(this.targetEditor.getValue(), true));
            } else {
                this.targetEditor.setValue(vkbeautify.xmlmin(this.targetEditor.getValue(), true));
            }
        } catch (e) {
            console.log("Invalid format", e);
            this.setState({errorMessage: e.message});
        }
    }
    onFileTypeSelect = (evt) => {
        const selectedFileType = evt.target.value;
        this.setState({selectedFileType: selectedFileType});
        $("#xmlTextArea").empty();
        if (selectedFileType === 'XML') {
            this.sourceEditor = this.createCodeMirrorEditor('xml', 'xmlTextArea', '');
        } else {
            this.sourceEditor = this.createCodeMirrorEditor('application/ld+json', 'xmlTextArea', '');
        }
    }

    createCodeMirrorEditor(mode, targetElem, value) {
        return CodeMirror(document.getElementById(targetElem), {
            value: value,
            mode: mode,
            readOnly: false,
            styleActiveLine: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            lineNumbers: true,
            foldGutter: true,
            lineWrapping: true,
            extraKeys: {
                "Ctrl-Q": function (cm) {
                    cm.foldCode(cm.getCursor());
                }
            },
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
    }

    convert = () => {
        $('#treeView li').empty();
        this.setState({errorMessage: ''});
        try {
            if (this.state.selectedFileType === 'XML') {
                let json = xml2JSON.xml2json(this.sourceEditor.getValue(), {compact: true, spaces: 2});
                this.targetEditor = this.createCodeMirrorEditor("application/ld+json", 'previewArea', json);
            } else {

                let xml = xml2JSON.json2xml(this.sourceEditor.getValue(), {
                    ignoreComment: false,
                    spaces: 2,
                    compact: true
                });
                this.targetEditor = this.createCodeMirrorEditor("xml", 'previewArea', xml);
            }
        } catch (e) {
            console.log("Invalid format", e);
            this.setState({errorMessage: e.message});
        }

        this.setState({showJSONFormatBtn: true});
    }

    preview = () => {
        try {
            var tree = $.parseXML(this.sourceEditor.getValue()); //$.parseXML($('#xmlTextArea').val());
            $('#treeView li').empty();
            this.traverse($('#treeView li'), tree.firstChild)
            // this – is an —
            $('<span style="padding-right: 10px; padding-left: 10px; font-size: 15px">&#9660;</span>').prependTo('#treeView li:has(li)').click(function () {
                var sign = $(this).text()
                if (sign === "▼")
                    $(this).html('&#9658;').next().children().hide()
                else
                    $(this).html('&#9660;').next().children().show()
            });
        } catch (e) {
            console.log("Invalid format", e);
            this.setState({errorMessage: e.message});
        }
    }

    traverse(node, tree) {
        var children = $(tree).children()
        node.append(tree.nodeName)
        if (children.length) {
            var ul = $("<ul style=\"list-style-type: none;\">").appendTo(node)
            children.each((idx, elm) => {
                var li = $('<li>').appendTo(ul)
                this.traverse(li, elm)
            })
        } else {

            let attributes = '';
            $.each($(tree).get(0).attributes, function (i, attrib) {
                attributes = attributes + `<li><span class="label"> ${attrib.name} : ${attrib.value}</span></li>`
            });

            $('<ul>' + attributes + '<li>' + $(tree).text() + '</li></ul>').appendTo(node)
        }
    }

    render() {
        return (
            <div className="container">
                <header className="navbar bg-gray ">
                    <section className="navbar-section" style={{display: 'flex', alignItems: 'center'}}>
                        <img src="./static/icons/logo.svg" style={{height: '40px', width: '150px'}} alt="XML JSON Editor"/> <h4
                        style={{paddingTop: '4px'}}>Editor</h4>
                    </section>

                </header>

                <div id="container">
                    <div id="left_panel">

                        <ul className="menu">
                            <li className="menu-item">
                                <div style={{display: 'flex'}}>
                                    <div style={{flex: '1'}}>

                                        <button className="btn btn-primary btn-sm" onClick={this.formatSource}>Beautify
                                        </button>
                                        &nbsp;
                                        <button className="btn btn-primary btn-sm" onClick={this.compactSource}>Compact
                                        </button>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-radio">
                                            <input type="radio" value="XML" name="filetype"
                                                   checked={this.state.selectedFileType === 'XML'}
                                                   onChange={this.onFileTypeSelect}/>
                                            <i className="form-icon"></i> XML
                                        </label>
                                        <label className="form-radio">
                                            <input type="radio" value="JSON" name="filetype"
                                                   checked={this.state.selectedFileType === 'JSON'}
                                                   onChange={this.onFileTypeSelect}/>
                                            <i className="form-icon"></i> JSON
                                        </label>
                                    </div>
                                    <div style={{flex: '1', textAlign: 'right'}}>
                                        {this.state.selectedFileType === 'XML' &&
                                        <button className="btn btn-primary btn-sm"
                                                onClick={this.preview}>Tree &#9658;</button>
                                        }
                                        &nbsp;
                                        <button className="btn btn-primary btn-sm"
                                                onClick={this.convert}>{this.state.selectedFileType === 'XML' ? 'JSON' : 'XML'} &#9658;</button>
                                    </div>
                                </div>
                            </li>
                            <li className="divider"></li>
                            <li className="menu-item">
                                <div style={{width: '100%'}} id="xmlTextArea"></div>
                            </li>

                        </ul>

                    </div>
                    <div id="right_panel">
                        <div id="drag" className="bg-gray">
                            &nbsp;
                        </div>
                        <ul className="menu" style={{marginLeft: '18px'}}>
                            {this.state.showJSONFormatBtn &&

                            <li className="menu-item" style={{display: 'flex'}}>
                                {this.state.errorMessage &&
                                <div className="toast toast-error" style={{flex: '3', textAlign: 'left'}}>
                                    <button className="btn btn-clear float-right"></button>
                                    {this.state.errorMessage}
                                </div>
                                }
                                <div style={{flex: '1', textAlign: 'right'}}>
                                    <button className="btn btn-primary btn-sm" onClick={this.formatPreview}>Beautify
                                    </button>
                                    &nbsp;
                                    <button className="btn btn-primary btn-sm" onClick={this.compactPreview}>Compact
                                    </button>
                                </div>
                            </li>
                            }
                            <li className="divider">

                            </li>
                            <li className="menu-item">
                                <ul id="treeView" style={{listStyleType: 'none', marginLeft: '6px'}}>
                                    <li id="previewArea">

                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>


        )
    }
}


export default XMLEditor;

