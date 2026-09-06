import { ScopedFieldRegistry, baseRegistry } from "@/lib/field-registry";
import { FormPinVariableSelect } from "../form-controls/FormPinVariableSelect";
import { FormPinEntitySelect } from "../form-controls/FormPinEntitySelect";
import { FormPinAssetUpload } from "../form-controls/FormPinAssetUpload";
import { FormPinPathInput } from "../form-controls/FormPinPathInput";

/**
 * Sàn Registry dành riêng cho Pipeline Inspector và Pipeline Form.
 * Kế thừa toàn bộ các Form Control cơ sở (input, number, switch, select, textarea, tagsInput, keyValue, v.v.)
 * từ baseRegistry, và đăng ký thêm các control đặc thù của Pipeline.
 */
export const pipelineRegistry = new ScopedFieldRegistry(baseRegistry);

// Đăng ký trực tiếp các Pipeline-specific form controls vào sàn
pipelineRegistry.register({
  type: "pin:variableSelect",
  component: FormPinVariableSelect,
});

pipelineRegistry.register({
  type: "pin:entitySelect",
  component: FormPinEntitySelect,
});

pipelineRegistry.register({
  type: "pin:assetUpload",
  component: FormPinAssetUpload,
});

pipelineRegistry.register({
  type: "pin:path",
  component: FormPinPathInput,
});
