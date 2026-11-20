import assert from "assert";
import { imageRefsInMarkdown, isImageExtension } from "../src/images";

const refs = imageRefsInMarkdown(`
![[photo.jpg]]
![[pic.png|200]]
![](attachments/a%20b.png)
![alt](https://example.com/a.png)
`);

assert.deepStrictEqual(refs, [
  "photo.jpg",
  "pic.png",
  "attachments/a b.png",
]);
assert.strictEqual(isImageExtension("PNG"), true);
assert.strictEqual(isImageExtension(".jpg"), true);
assert.strictEqual(isImageExtension("md"), false);
console.log("folder-image-gallery ok");
