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

      if (latestVersion && latestVersion > currentVersion) {
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
