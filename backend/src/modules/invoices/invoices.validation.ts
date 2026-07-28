export function validateFiles(
    files?: Express.Multer.File[]
) {

    if (!files?.length) {
        return "No invoice files uploaded.";
    }

    return null;

}