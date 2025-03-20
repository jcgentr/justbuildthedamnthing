import { render, screen, fireEvent } from "@testing-library/react";
import UrlEncoder from "@/app/tools/url-encoder/page";
import "@testing-library/jest-dom";
import { toast } from "sonner";

// Mock clipboard API
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: jest.fn(() => Promise.resolve()),
  },
  configurable: true,
});

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("UrlEncoder", () => {
  // Test samples
  const plainText = "Hello, world! Special chars: &^%$#@";
  const encodedText =
    "Hello%2C%20world!%20Special%20chars%3A%20%26%5E%25%24%23%40";
  const invalidUrlEncoded = "%E0%A4%A"; // Incomplete UTF-8 sequence

  beforeEach(() => {
    jest.clearAllMocks();
    render(<UrlEncoder />);
  });

  it("renders the component with all necessary elements", () => {
    expect(screen.getByText("URL Encoder")).toBeInTheDocument();
    expect(screen.getByText("Encode")).toBeInTheDocument();
    expect(screen.getByText("Decode")).toBeInTheDocument();
    expect(screen.getByText("Swap")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter text to encode/decode...")
    ).toBeInTheDocument();
  });

  it("encodes text to URL encoded format correctly", () => {
    const input = screen.getByPlaceholderText("Enter text to encode/decode...");
    const encodeButton = screen.getByText("Encode");

    fireEvent.change(input, { target: { value: plainText } });
    fireEvent.click(encodeButton);

    const output = screen.getByRole("textbox", { name: /output/i });
    expect(output).toHaveValue(encodedText);
  });

  it("decodes URL encoded text correctly", () => {
    const input = screen.getByPlaceholderText("Enter text to encode/decode...");
    const decodeButton = screen.getByText("Decode");

    fireEvent.change(input, { target: { value: encodedText } });
    fireEvent.click(decodeButton);

    const output = screen.getByRole("textbox", { name: /output/i });
    expect(output).toHaveValue(plainText);
  });

  it("handles invalid URL encoded string when decoding", () => {
    const input = screen.getByPlaceholderText("Enter text to encode/decode...");
    const decodeButton = screen.getByText("Decode");

    fireEvent.change(input, { target: { value: invalidUrlEncoded } });
    fireEvent.click(decodeButton);

    // Check for error text
    const errorElement = screen.getByText("Invalid URL-encoded string");
    expect(errorElement).toBeInTheDocument();
  });

  it("clears all fields when clear button is clicked", () => {
    const input = screen.getByPlaceholderText("Enter text to encode/decode...");
    const encodeButton = screen.getByText("Encode");
    const clearButton = screen.getByText("Clear");
    const output = screen.getByRole("textbox", { name: /output/i });

    // First enter and encode text
    fireEvent.change(input, { target: { value: plainText } });
    fireEvent.click(encodeButton);
    expect(output).toHaveValue(encodedText);

    // Then clear
    fireEvent.click(clearButton);
    expect(input).toHaveValue("");
    expect(output).toHaveValue("");
  });

  it("swaps output to input when swap button is clicked", () => {
    const input = screen.getByPlaceholderText("Enter text to encode/decode...");
    const encodeButton = screen.getByText("Encode");
    const swapButton = screen.getByText("Swap");
    const output = screen.getByRole("textbox", { name: /output/i });

    // First enter and encode text
    fireEvent.change(input, { target: { value: plainText } });
    fireEvent.click(encodeButton);
    expect(output).toHaveValue(encodedText);

    // Then swap
    fireEvent.click(swapButton);
    expect(input).toHaveValue(encodedText);
    expect(output).toHaveValue("");
  });

  it("does not allow swap when output is empty", () => {
    const input = screen.getByPlaceholderText("Enter text to encode/decode...");
    const swapButton = screen.getByText("Swap");

    // Set input but don't encode to keep output empty
    fireEvent.change(input, { target: { value: plainText } });

    // Try to swap
    fireEvent.click(swapButton);

    // Input should remain unchanged
    expect(input).toHaveValue(plainText);
    expect(toast.error).toHaveBeenCalledWith("Nothing to swap");
  });

  it("copies output to clipboard when copy button is clicked", () => {
    const input = screen.getByPlaceholderText("Enter text to encode/decode...");
    const encodeButton = screen.getByText("Encode");

    // First enter and encode text
    fireEvent.change(input, { target: { value: plainText } });
    fireEvent.click(encodeButton);

    // Click the copy button
    const copyButton = screen.getByText("Copy");
    fireEvent.click(copyButton);

    // Check that clipboard API was called with correct value
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(encodedText);
  });

  it("shows error when trying to copy empty output", () => {
    // Ensure output is empty
    const clearButton = screen.getByText("Clear");
    fireEvent.click(clearButton);

    // Try to access copy button (should not exist when output is empty)
    const copyButton = screen.queryByText("Copy");
    expect(copyButton).not.toBeInTheDocument();
  });
});
