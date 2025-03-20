import { render, screen, fireEvent } from "@testing-library/react";
import JsonFormatter from "@/app/tools/json-formatter/page";

describe("JsonFormatter", () => {
  // Simple valid JSON object
  const validJson = JSON.stringify(
    {
      name: "Test Object",
      numbers: [1, 2, 3, 4, 5],
      nested: {
        key: "value",
        array: ["a", "b", "c"],
        object: {
          boolean: true,
          null: null,
        },
      },
      special: 'Hello "World" with \n newlines and \t tabs',
    },
    null,
    2
  );

  // Pre-formatted JSON that matches JSON.stringify(obj, null, 2) output
  const formattedJson = JSON.stringify(JSON.parse(validJson), null, 2);

  // Minified JSON that matches JSON.stringify(obj) output
  const minifiedJson = JSON.stringify(JSON.parse(validJson));

  // Invalid JSON sample
  const invalidJson = `{
    name: "test"
  }`;

  beforeEach(() => {
    render(<JsonFormatter />);
  });

  it("renders the component with all necessary elements", () => {
    expect(screen.getByText("JSON Formatter")).toBeInTheDocument();
    expect(screen.getByText("Format")).toBeInTheDocument();
    expect(screen.getByText("Minify")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Paste your JSON here...")
    ).toBeInTheDocument();
  });

  it("formats valid JSON correctly", () => {
    const input = screen.getByPlaceholderText("Paste your JSON here...");
    const formatButton = screen.getByText("Format");

    fireEvent.change(input, { target: { value: validJson } });
    fireEvent.click(formatButton);

    const output = screen.getByRole("textbox", { name: /output/i });
    expect(output).toHaveValue(formattedJson);
  });

  it("minifies valid JSON correctly", () => {
    const input = screen.getByPlaceholderText("Paste your JSON here...");
    const minifyButton = screen.getByText("Minify");

    fireEvent.change(input, { target: { value: validJson } });
    fireEvent.click(minifyButton);

    const output = screen.getByRole("textbox", { name: /output/i });
    expect(output).toHaveValue(minifiedJson);
  });

  it("shows error for invalid JSON", () => {
    const input = screen.getByPlaceholderText("Paste your JSON here...");
    const formatButton = screen.getByText("Format");

    fireEvent.change(input, { target: { value: invalidJson } });
    fireEvent.click(formatButton);

    expect(screen.getByText("Invalid JSON")).toBeInTheDocument();
  });

  it("clears output when invalid JSON is entered", () => {
    const input = screen.getByPlaceholderText("Paste your JSON here...");
    const formatButton = screen.getByText("Format");
    const output = screen.getByRole("textbox", { name: /output/i });

    // First enter valid JSON
    fireEvent.change(input, { target: { value: validJson } });
    fireEvent.click(formatButton);
    expect(output).toHaveValue(formattedJson);

    // Then enter invalid JSON
    fireEvent.change(input, { target: { value: invalidJson } });
    fireEvent.click(formatButton);
    expect(output).toHaveValue("");
  });
});
