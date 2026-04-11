import { debugLogger } from "@main/debugLogger";
import { type ExecException, exec } from "child_process";

const MAX_TIMEOUT = 300_000; // 5 minutes

export class SystemCommandHandler {
  async executeCommand(
    step: {
      command: string;
      cwd?: string;
      timeout?: number;
      shell?: string;
      storeKey?: string;
      storeStderrKey?: string;
      storeExitCodeKey?: string;
      failOnNonZero?: boolean;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const command = substituteVariables(step.command);
    const cwd = step.cwd ? substituteVariables(step.cwd) : undefined;
    const timeout = Math.min(Math.max(1000, Number(step.timeout ?? 30_000)), MAX_TIMEOUT);
    const shell = step.shell ? substituteVariables(step.shell) : undefined;
    const failOnNonZero = step.failOnNonZero !== false;

    debugLogger.debug("SystemCommand", "Executing command", { command, cwd, timeout });

    const result = await new Promise<{ stdout: string; stderr: string; exitCode: number }>(
      (resolve, reject) => {
        exec(
          command,
          { cwd, timeout, shell },
          (error: ExecException | null, stdout: string, stderr: string) => {
            const exitCode = error?.code ?? 0;
            if (error && failOnNonZero && typeof exitCode === "number" && exitCode !== 0) {
              reject(
                new Error(`Command exited with code ${exitCode}: ${stderr.trim() || error.message}`)
              );
              return;
            }
            resolve({
              stdout: stdout ?? "",
              stderr: stderr ?? "",
              exitCode: typeof exitCode === "number" ? exitCode : 0,
            });
          }
        );
      }
    );

    debugLogger.debug("SystemCommand", "Command completed", {
      exitCode: result.exitCode,
      stdoutLength: result.stdout.length,
    });

    if (step.storeKey) variables[step.storeKey] = result.stdout.trim();
    if (step.storeStderrKey) variables[step.storeStderrKey] = result.stderr.trim();
    if (step.storeExitCodeKey) variables[step.storeExitCodeKey] = result.exitCode;

    return result;
  }
}
