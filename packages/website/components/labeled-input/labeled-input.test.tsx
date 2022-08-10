import { render, screen } from "@testing-library/react";

import { LabeledInput } from "./labeled-input";

test("should render LabeledInput", async () => {
  render(
    <LabeledInput
      id="labeled-input"
      label="label"
      value="value"
      onChangeInputValue={(changedInput) => console.log(changedInput)}
    />
  );

  await screen.findByLabelText("label");
});
