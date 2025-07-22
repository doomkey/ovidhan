import { alertController, loadingController } from "@ionic/vue";
import { CapacitorHttp, type HttpResponse } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";
import { useLanguage } from "./useLanguage";
interface UpdateInfo {
  isUpdateAvailable: boolean;
  latestVersion?: string;
  releaseUrl?: string;
}

export function useUpdater() {
  const { t } = useLanguage();

  const checkForUpdate = async (showLoading = false): Promise<UpdateInfo> => {
    let loading = null;
    if (showLoading) {
      loading = await loadingController.create({
        message: t("updateChecking"),
        spinner: "crescent",
      });
      await loading.present();
    }

    const owner = "doomkey";
    const repo = "ovidhan";

    const options = {
      url: `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
      headers: { "Content-Type": "application/json" },
    };

    try {
      const [appInfo, response] = await Promise.all([
        App.getInfo(),
        CapacitorHttp.get(options) as Promise<HttpResponse>,
      ]);

      const currentVersion = appInfo.version;
      const latestRelease = response.data;
      const latestVersionTag = latestRelease.tag_name || "";
      const latestVersion = latestVersionTag.replace(/^v/, "");

      if (loading) {
        await loading.dismiss();
      }

      if (latestVersion && compareVersions(latestVersion, currentVersion)) {
        return {
          isUpdateAvailable: true,
          latestVersion: latestVersion,
          releaseUrl: latestRelease.html_url,
        };
      } else {
        return { isUpdateAvailable: false };
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
      if (loading) {
        await loading.dismiss();
      }
      return { isUpdateAvailable: false };
    }
  };
  function compareVersions(v1: string, v2: string) {
    // Split strings into arrays of numbers
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    // Get the length of the longest version array
    const maxLength = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < maxLength; i++) {
      // Use 0 if a version part doesn't exist (e.g., comparing "1.1" to "1.1.1")
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;

      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }

    return 0;
  }

  const presentUpdateAlert = async (updateInfo: UpdateInfo) => {
    if (updateInfo.isUpdateAvailable) {
      const alert = await alertController.create({
        header: t("updateAvailable"),
        message: `${t("updateAvailableMessage")} (v${
          updateInfo.latestVersion
        })`,
        buttons: [
          { text: t("updateLater"), role: "cancel" },
          {
            text: t("updateDownload"),
            handler: () => {
              if (updateInfo.releaseUrl) {
                Browser.open({ url: updateInfo.releaseUrl });
              }
            },
          },
        ],
      });
      await alert.present();
    } else {
      const alert = await alertController.create({
        header: t("updateNone"),
        message: t("updateNoneMessage"),
        buttons: [t("ok")],
      });
      await alert.present();
    }
  };

  return {
    checkForUpdate,
    presentUpdateAlert,
  };
}
