import os

SLIDE_FILE_NAME="_slide.md"
EXCLUDE_DIRS=["assets", "slides"]

def delete_slide_files(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(SLIDE_FILE_NAME):
                file_path = os.path.join(root, file)
                os.remove(file_path)
                print(f"File '{file}' deleted successfully.")

def create_slide_file(file_path):
    # Read content from original .md file
    with open(file_path, 'r', encoding='utf-8') as original_file:
        original_content = original_file.read()

    # Get file name without extension
    file_name = os.path.splitext(os.path.basename(file_path))[0]

    # Construct new file name for slide version
    slide_file_name = f"{file_name}_slide.md"
    slide_file_path = os.path.join(os.path.dirname(file_path), slide_file_name)

     # Add or modify template header
    if original_content.startswith("---"):
        # If header exists, insert template header after the first header line
        header_end = original_content.find("---", 3)
        slide_content = original_content[:header_end] + "template: reveal.html\n" + original_content[header_end:]
    else:
        # If no header exists, create a new one with template header
        slide_content = "---\ntemplate: reveal.html\n---\n\n" + original_content

    # Write the new content to slide file
    with open(slide_file_path, 'w', encoding='utf-8') as slide_file:
        slide_file.write(slide_content)

    print(f"Slide file '{slide_file_name}' created successfully.")

def main():
    # Specify the directory path
    docs_folder = "docs"

    delete_slide_files(docs_folder)

    # Walk through the directory and its subdirectories
    for root, _, files in os.walk(docs_folder):
        if any(folder in root for folder in EXCLUDE_DIRS):
            continue
        for file in files:
            # Exclude assets folder and slide files
            if not file.endswith(SLIDE_FILE_NAME):
                file_path = os.path.join(root, file)
                if file.endswith(".md"):
                    create_slide_file(file_path)

if __name__ == "__main__":
    main()
