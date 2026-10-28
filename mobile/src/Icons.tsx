import React, { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { device } from "./api";
import { colors } from "./ui";
const cache = new Map<string, string>();
export function Icon({
  name,
  selected = false,
}: {
  name: string;
  selected?: boolean;
}) {
  const [uri, setUri] = useState(cache.get(name));
  useEffect(() => {
    let active = true;
    if (cache.has(name)) setUri(cache.get(name));
    else if (device.symbol)
      void device
        .symbol(name)
        .then((value) => {
          cache.set(name, value);
          if (active) setUri(value);
        })
        .catch(() => {});
    return () => {
      active = false;
    };
  }, [name]);
  return uri ? (
    <Image
      accessible={false}
      source={{ uri }}
      style={{
        width: 23,
        height: 23,
        tintColor: selected ? colors.accent : colors.muted,
      }}
      resizeMode="contain"
    />
  ) : (
    <View style={{ width: 23, height: 23 }} />
  );
}
