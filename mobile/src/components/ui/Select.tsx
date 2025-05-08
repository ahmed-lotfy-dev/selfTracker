import React from "react"
import { View } from "react-native"
import * as SelectPrimitive from "@rn-primitives/select"

export const SelectComponent = () => {
  return (
    <SelectPrimitive.Root defaultValue={{ value: "apple", label: "Apple" }}>
      <SelectPrimitive.Trigger>
        <SelectPrimitive.Value placeholder="Select a fruit" />
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Overlay>
          <SelectPrimitive.Content>
            <SelectPrimitive.ScrollUpButton />
            <SelectPrimitive.Viewport>
              <SelectPrimitive.Group>
                <SelectPrimitive.Label>Fruits</SelectPrimitive.Label>
                <SelectPrimitive.Item label="Apple" value="apple">
                  Apple
                  <SelectPrimitive.ItemIndicator />
                </SelectPrimitive.Item>
                <SelectPrimitive.Item label="Banana" value="banana">
                  Banana
                  <SelectPrimitive.ItemIndicator />
                </SelectPrimitive.Item>
                <SelectPrimitive.Item label="Blueberry" value="blueberry">
                  Blueberry
                  <SelectPrimitive.ItemIndicator />
                </SelectPrimitive.Item>
                <SelectPrimitive.Item label="Grapes" value="grapes">
                  Grapes
                  <SelectPrimitive.ItemIndicator />
                </SelectPrimitive.Item>
                <SelectPrimitive.Item label="Pineapple" value="pineapple">
                  Pineapple
                  <SelectPrimitive.ItemIndicator />
                </SelectPrimitive.Item>
              </SelectPrimitive.Group>
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton />
          </SelectPrimitive.Content>
        </SelectPrimitive.Overlay>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
