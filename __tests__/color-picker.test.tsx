import { render, screen, fireEvent } from "@testing-library/react";
import ColorPicker from "@/app/tools/color-picker/page";
import "@testing-library/jest-dom";

describe("ColorPicker", () => {
  // Test color values
  const blackHex = "#000000";
  const blackRgb = "rgb(0, 0, 0)";
  const blackHsl = "hsl(0, 0%, 0%)";

  const redHex = "#ff0000";
  const redRgb = "rgb(255, 0, 0)";
  const redHsl = "hsl(0, 100%, 50%)";

  beforeEach(() => {
    render(<ColorPicker />);
  });

  it("renders the component with all necessary elements", () => {
    expect(screen.getByText("Color Picker")).toBeInTheDocument();
    expect(
      screen.getByText("Pick and convert colors between formats")
    ).toBeInTheDocument();
    expect(screen.getByText("HEX")).toBeInTheDocument();
    expect(screen.getByText("RGB")).toBeInTheDocument();
    expect(screen.getByText("HSL")).toBeInTheDocument();

    // Both the color picker and hex display show the same value
    const hexValues = screen.getAllByDisplayValue(blackHex);
    expect(hexValues.length).toBeGreaterThan(0);

    // Check that the black color values are displayed correctly
    expect(screen.getByDisplayValue(blackRgb)).toBeInTheDocument();
    expect(screen.getByDisplayValue(blackHsl)).toBeInTheDocument();
  });

  it("updates all color formats when color input changes", () => {
    // Use querySelector directly to find the color input
    const colorInput = document.querySelector('input[type="color"]');
    expect(colorInput).not.toBeNull();

    fireEvent.change(colorInput!, { target: { value: redHex } });

    // Check if all values are updated
    expect(screen.getAllByDisplayValue(redHex).length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue(redRgb)).toBeInTheDocument();
    expect(screen.getByDisplayValue(redHsl)).toBeInTheDocument();
  });
});
