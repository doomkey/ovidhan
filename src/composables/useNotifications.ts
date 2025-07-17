import { ref, readonly } from "vue";
import {
  LocalNotifications,
  ScheduleOptions,
  PermissionStatus,
} from "@capacitor/local-notifications";
import { useWordOfTheDay } from "./useWordOfTheDay";

const notificationPermission = ref<PermissionStatus | null>(null);

export function useNotifications() {
  const checkPermission = async () => {
    const status = await LocalNotifications.checkPermissions();
    notificationPermission.value = status;
    return status.display;
  };

  const requestPermission = async () => {
    const status = await LocalNotifications.requestPermissions();
    notificationPermission.value = status;
    return status.display;
  };

  const scheduleDailyNotification = async () => {
    // First, ensure permissions are granted.
    const permission = await checkPermission();
    if (permission !== "granted") {
      console.log("Notification permission not granted. Cannot schedule.");
      return false;
    }

    // Get the word of the day to display in the notification.
    const { wordOfTheDay } = useWordOfTheDay();
    if (!wordOfTheDay.value) {
      console.log("No word of the day available to schedule.");
      return false;
    }

    await LocalNotifications.createChannel({
      id: "word_of_the_day_channel",
      name: "Word of the Day",
      description: "Daily word notifications",
      importance: 3, // Default importance
      visibility: 1, // Public visibility
    });

    // Schedule the notification to fire at 6 PM (18:00) every day.
    const options: ScheduleOptions = {
      notifications: [
        {
          id: 1, // A unique ID for this recurring notification
          title: "📖 Word of the Day",
          body: `Today's word is "${wordOfTheDay.value.en}". Tap to learn more!`,
          schedule: {
            on: {
              hour: 18,
              minute: 0,
            },
            repeats: true,
          },
          channelId: "word_of_the_day_channel",
        },
      ],
    };

    try {
      await LocalNotifications.schedule(options);
      console.log("Daily notification scheduled successfully.");
      return true;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      return false;
    }
  };

  const cancelDailyNotification = async () => {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
      console.log("Daily notification canceled.");
    } catch (error) {
      console.error("Error canceling notification:", error);
    }
  };

  return {
    notificationPermission: readonly(notificationPermission),
    checkPermission,
    requestPermission,
    scheduleDailyNotification,
    cancelDailyNotification,
  };
}
