/**
 * NICHE — specimen sharing.
 *
 * Captures the off-screen SpecimenCard as a PNG and opens the native
 * share sheet. Both react-native-view-shot and expo-sharing are
 * standard Expo-compatible packages — no extra native config needed
 * for an EAS managed-workflow build.
 */

import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { View } from "react-native";

export async function shareSpecimenCard(viewRef: React.RefObject<View>): Promise<void> {
  if (!viewRef.current) return;

  try {
    const uri = await captureRef(viewRef, { format: "png", quality: 0.95 });

    const available = await Sharing.isAvailableAsync();
    if (!available) {
      console.warn("Sharing isn't available on this device");
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType: "image/png",
      dialogTitle: "Share your find",
    });
  } catch (err) {
    console.warn("Failed to share specimen card", err);
  }
}
