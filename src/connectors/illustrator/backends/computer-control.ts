import { detectIllustrator } from "../detect.ts";
import { captureScreenshot, identifyForegroundApp } from "../../../computer/controller.ts";
import { err, type Result } from "../../../lib/result.ts";
import { loadConfig } from "../../../config.ts";

export function illustratorViaComputer(): Result<{ app: string; screenshotPath?: string }> {
  const config = loadConfig();
  if (!config.computerControlAllowed) {
    return err(
      "computer_control_disabled",
      "GUI control is disabled. Programmatic backends must be used. Set CREATIVE_AGENT_ALLOW_COMPUTER_CONTROL=1 only as a last resort.",
    );
  }
  const detection = detectIllustrator();
  if (!detection.running) {
    return err("illustrator_closed", detection.message);
  }
  const app = identifyForegroundApp();
  if (!app.ok) return app;
  if (!/illustrator/i.test(app.value.name)) {
    return err(
      "wrong_application",
      `Foreground application is "${app.value.name}", not Illustrator. Computer control will not click blindly.`,
    );
  }
  const shot = captureScreenshot();
  return { ok: true, value: { app: app.value.name, screenshotPath: shot.ok ? shot.value.path : undefined } };
}
