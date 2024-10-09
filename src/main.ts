import { Terminal } from "./terminal";
import "./style.css"
import { OutputStream } from "./io";
import { Shell } from "./shell";

const terminalElement = document.getElementById('terminal') as HTMLElement;
const terminal = new Terminal(terminalElement);

const stdout = new OutputStream();
const stderr = new OutputStream();

stdout.onWrite((data) => terminal.write(data));
stderr.onWrite((data) => terminal.write(`<span style="color: red;">${data}</span>`));

const shell = new Shell(stdout, stderr);

document.addEventListener('keydown', (event) => {
  shell.handleInput(event.key);
});

