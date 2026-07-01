export const CLI_PACKAGE_COMMAND = 'npx @onedigitas/kitcode';

export function kitCodeCommand(command?: string) {
  return command ? `${CLI_PACKAGE_COMMAND} ${command}` : CLI_PACKAGE_COMMAND;
}
