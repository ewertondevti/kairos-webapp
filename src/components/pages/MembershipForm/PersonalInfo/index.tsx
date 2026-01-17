import { PostalAddressRecord } from "@/components/pages/MembershipForm/PersonalInfo/types";
import {
  GenderEnum,
  MaritalStatusEnum,
  MembershipFields,
} from "@/features/membership/membership.enums";
import { beforeUpload, convertFileToBase64 } from "@/helpers/app";
import { IMemberPhoto } from "@/types/store";
import {
  dateInputFormat,
  disabledDate,
  formatPersonName,
  formatPostalCode,
  personNameRules,
  postalCodeRegex,
  requiredRules,
} from "@/utils/app";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  ButtonProps,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Tooltip,
  Upload,
} from "antd";
import type { Rule } from "antd/es/form";
import type { DefaultOptionType } from "antd/es/select";
import Title from "antd/es/typography/Title";
import { RcFile, UploadProps } from "antd/es/upload";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import styles from "./PersonalInfo.module.scss";

type PersonalInfoProps = {
  requiredFields?: MembershipFields[];
};

const toStringValue = (value: unknown) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return undefined;
};

const pickValue = (item: Record<string, unknown>, keys: string[]) =>
  keys.map((key) => item[key]).find((value) => toStringValue(value));

const normalizePostalRecord = (
  item: Record<string, unknown>
): PostalAddressRecord | null => {
  const district = toStringValue(
    pickValue(item, ["Distrito", "distrito", "district"])
  );
  const county = toStringValue(
    pickValue(item, ["Concelho", "concelho", "municipio", "county"])
  );
  const parish = toStringValue(
    pickValue(item, ["Freguesia", "freguesia", "parish", "localidade"])
  );
  const address = toStringValue(
    pickValue(item, ["Morada", "morada", "address", "rua"])
  );
  const addressNumber = toStringValue(
    pickValue(item, ["numero", "numeroMorada", "numero_morada", "Numero"])
  );
  const addressFloor = toStringValue(
    pickValue(item, ["andar", "piso", "floor", "Andar"])
  );
  const addressDoor = toStringValue(
    pickValue(item, [
      "porta",
      "door",
      "numeroPorta",
      "numero_porta",
      "NumeroPorta",
    ])
  );

  if (!district || !county || !parish || !address) {
    return null;
  }

  return {
    district,
    county,
    parish,
    address,
    addressNumber,
    addressFloor,
    addressDoor,
  };
};

const normalizePostalResponse = (data: unknown): PostalAddressRecord[] => {
  if (!data) return [];
  const raw =
    Array.isArray(data) && data.length
      ? data
      : typeof data === "object" && data !== null
      ? (data as { data?: unknown; results?: unknown }).data ??
        (data as { results?: unknown }).results ??
        data
      : [];

  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) =>
      item && typeof item === "object"
        ? normalizePostalRecord(item as Record<string, unknown>)
        : null
    )
    .filter((item): item is PostalAddressRecord => Boolean(item));
};

const selectFilterOption = (
  input: string,
  option?: DefaultOptionType
): boolean =>
  String(option?.label ?? option?.value ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

export const PersonalInfo = ({ requiredFields }: PersonalInfoProps) => {
  const form = Form.useFormInstance();
  const isRequiredField = (field: MembershipFields) =>
    !requiredFields || requiredFields.includes(field);
  const getRequiredRules = (field: MembershipFields) =>
    isRequiredField(field) ? requiredRules : undefined;
  const emailRules: Rule[] = isRequiredField(MembershipFields.Email)
    ? [...requiredRules, { type: "email" as const, message: "Email inválido." }]
    : [{ type: "email" as const, message: "Email inválido." }];

  const photoValue = Form.useWatch(MembershipFields.Photo, form);
  const postalCodeValue = Form.useWatch(MembershipFields.PostalCode, form);
  const districtValue = Form.useWatch(MembershipFields.State, form);
  const countyValue = Form.useWatch(MembershipFields.County, form);
  const parishValue = Form.useWatch(MembershipFields.City, form);
  const addressValue = Form.useWatch(MembershipFields.Address, form);
  const addressNumberValue = Form.useWatch(
    MembershipFields.AddressNumber,
    form
  );
  const addressFloorValue = Form.useWatch(MembershipFields.AddressFloor, form);
  const addressDoorValue = Form.useWatch(MembershipFields.AddressDoor, form);
  const imageUrl = useMemo(() => {
    if (!photoValue) {
      return undefined;
    }
    if (typeof photoValue === "string") {
      if (
        photoValue.startsWith("file://") ||
        photoValue.includes("fakepath") ||
        /^[a-zA-Z]:\\/.test(photoValue)
      ) {
        return undefined;
      }
      return photoValue;
    }
    if (typeof photoValue === "object") {
      const maybePhoto = photoValue as { file?: string; url?: string };
      return maybePhoto.file ?? maybePhoto.url;
    }
    return undefined;
  }, [photoValue]);

  const genderOptions = [
    { label: "Masculino", value: GenderEnum.Male },
    { label: "Feminino", value: GenderEnum.Female },
  ];

  const martitalOptions = [
    { label: "Casado(a)", value: MaritalStatusEnum.Married },
    { label: "União de facto", value: MaritalStatusEnum.StableUnion },
    { label: "Solteiro(a)", value: MaritalStatusEnum.Single },
    { label: "Divorciado(a)", value: MaritalStatusEnum.Divorced },
  ];

  const normalizedPostalCode = useMemo(
    () => formatPostalCode(postalCodeValue),
    [postalCodeValue]
  );

  const postalDigits = useMemo(
    () => normalizedPostalCode?.replace(/\D/g, "") ?? "",
    [normalizedPostalCode]
  );

  const [postalLookupCode, setPostalLookupCode] = useState<string | null>(null);
  const [postalTouched, setPostalTouched] = useState(false);
  const isPostalComplete = Boolean(
    postalLookupCode && postalLookupCode.length === 7
  );

  const uniqueOptions = (values: string[]) =>
    Array.from(new Set(values)).map((value) => ({
      label: value,
      value,
    }));

  const ensureOptionValue = (
    options: Array<{ label: string; value: string }>,
    value?: string
  ) => {
    if (!value) return options;
    if (options.some((option) => option.value === value)) {
      return options;
    }
    return [{ label: value, value }, ...options];
  };

  const uniqueValues = (values: Array<string | undefined>) =>
    Array.from(new Set(values.filter(Boolean) as string[]));

  const { data: postalRecords = [], isFetching: postalRequestLoading } =
    useQuery({
      queryKey: ["postal-address", postalLookupCode],
      queryFn: async () => {
        const response = await axios.get("/api/address", {
          params: { postalCode: postalLookupCode },
        });
        return normalizePostalResponse(response.data);
      },
      enabled: isPostalComplete,
      staleTime: 5 * 60 * 1000,
    });

  const activePostalRecords = useMemo(
    () => (isPostalComplete ? postalRecords : []),
    [isPostalComplete, postalRecords]
  );

  const postalLoading = isPostalComplete && postalRequestLoading;

  const districtOptions = useMemo(() => {
    const options = uniqueOptions(
      activePostalRecords.map((record) => record.district)
    );
    return ensureOptionValue(options, districtValue);
  }, [activePostalRecords, districtValue]);

  const recordsByDistrict = useMemo(() => {
    if (!districtValue) return [];
    return activePostalRecords.filter(
      (record) => record.district === districtValue
    );
  }, [activePostalRecords, districtValue]);

  const countyOptions = useMemo(() => {
    const options = districtValue
      ? uniqueOptions(recordsByDistrict.map((record) => record.county))
      : [];
    return ensureOptionValue(options, countyValue);
  }, [districtValue, recordsByDistrict, countyValue]);

  const recordsByCounty = useMemo(() => {
    if (!countyValue) return [];
    return recordsByDistrict.filter((record) => record.county === countyValue);
  }, [recordsByDistrict, countyValue]);

  const parishOptions = useMemo(() => {
    const options = countyValue
      ? uniqueOptions(recordsByCounty.map((record) => record.parish))
      : [];
    return ensureOptionValue(options, parishValue);
  }, [countyValue, recordsByCounty, parishValue]);

  const recordsByParish = useMemo(() => {
    if (!parishValue) return [];
    return recordsByCounty.filter((record) => record.parish === parishValue);
  }, [recordsByCounty, parishValue]);

  const addressOptions = useMemo(() => {
    const options = parishValue
      ? uniqueOptions(recordsByParish.map((record) => record.address))
      : [];
    return ensureOptionValue(options, addressValue);
  }, [parishValue, recordsByParish, addressValue]);

  useEffect(() => {
    if (!postalTouched) {
      return;
    }

    if (!isPostalComplete) {
      form.setFieldsValue({
        [MembershipFields.State]: undefined,
        [MembershipFields.County]: undefined,
        [MembershipFields.City]: undefined,
        [MembershipFields.Address]: undefined,
        [MembershipFields.AddressNumber]: undefined,
        [MembershipFields.AddressFloor]: undefined,
        [MembershipFields.AddressDoor]: undefined,
      });
    }
  }, [form, isPostalComplete, postalTouched]);

  useEffect(() => {
    if (!postalTouched || !isPostalComplete) {
      return;
    }

    const districtValues = districtOptions.map((option) => option.value);
    if (
      districtValue &&
      districtValues.length &&
      !districtValues.includes(districtValue)
    ) {
      form.setFieldsValue({
        [MembershipFields.State]: undefined,
        [MembershipFields.County]: undefined,
        [MembershipFields.City]: undefined,
        [MembershipFields.Address]: undefined,
        [MembershipFields.AddressNumber]: undefined,
        [MembershipFields.AddressFloor]: undefined,
        [MembershipFields.AddressDoor]: undefined,
      });
      return;
    }

    if (!districtValue && districtValues.length === 1) {
      form.setFieldValue(MembershipFields.State, districtValues[0]);
    }
  }, [districtOptions, districtValue, form, isPostalComplete, postalTouched]);

  useEffect(() => {
    if (!postalTouched || !isPostalComplete) {
      return;
    }

    const countyValues = countyOptions.map((option) => option.value);
    if (
      countyValue &&
      countyValues.length &&
      !countyValues.includes(countyValue)
    ) {
      form.setFieldsValue({
        [MembershipFields.County]: undefined,
        [MembershipFields.City]: undefined,
        [MembershipFields.Address]: undefined,
        [MembershipFields.AddressNumber]: undefined,
        [MembershipFields.AddressFloor]: undefined,
        [MembershipFields.AddressDoor]: undefined,
      });
      return;
    }

    if (!countyValue && countyValues.length === 1) {
      form.setFieldValue(MembershipFields.County, countyValues[0]);
    }
  }, [countyOptions, countyValue, form, isPostalComplete, postalTouched]);

  useEffect(() => {
    if (!postalTouched || !isPostalComplete) {
      return;
    }

    const parishValues = parishOptions.map((option) => option.value);
    if (
      parishValue &&
      parishValues.length &&
      !parishValues.includes(parishValue)
    ) {
      form.setFieldsValue({
        [MembershipFields.City]: undefined,
        [MembershipFields.Address]: undefined,
        [MembershipFields.AddressNumber]: undefined,
        [MembershipFields.AddressFloor]: undefined,
        [MembershipFields.AddressDoor]: undefined,
      });
      return;
    }

    if (!parishValue && parishValues.length === 1) {
      form.setFieldValue(MembershipFields.City, parishValues[0]);
    }
  }, [parishOptions, parishValue, form, isPostalComplete, postalTouched]);

  useEffect(() => {
    if (!postalTouched || !isPostalComplete) {
      return;
    }

    const addressValues = addressOptions.map((option) => option.value);
    if (
      addressValue &&
      addressValues.length &&
      !addressValues.includes(addressValue)
    ) {
      form.setFieldsValue({
        [MembershipFields.Address]: undefined,
        [MembershipFields.AddressNumber]: undefined,
        [MembershipFields.AddressFloor]: undefined,
        [MembershipFields.AddressDoor]: undefined,
      });
      return;
    }

    if (!addressValue && addressValues.length === 1) {
      form.setFieldValue(MembershipFields.Address, addressValues[0]);
    }
  }, [addressOptions, addressValue, form, isPostalComplete, postalTouched]);

  useEffect(() => {
    if (!postalTouched || !isPostalComplete) {
      return;
    }

    if (!addressValue) {
      form.setFieldsValue({
        [MembershipFields.AddressNumber]: undefined,
        [MembershipFields.AddressFloor]: undefined,
        [MembershipFields.AddressDoor]: undefined,
      });
      return;
    }

    const matchingRecords = recordsByParish.filter(
      (record) => record.address === addressValue
    );

    const addressNumbers = uniqueValues(
      matchingRecords.map((record) => record.addressNumber)
    );
    const addressFloors = uniqueValues(
      matchingRecords.map((record) => record.addressFloor)
    );
    const addressDoors = uniqueValues(
      matchingRecords.map((record) => record.addressDoor)
    );

    const updates: Partial<Record<MembershipFields, string | undefined>> = {};

    if (addressNumbers.length === 1 && !addressNumberValue) {
      updates[MembershipFields.AddressNumber] = addressNumbers[0];
    } else if (
      addressNumberValue &&
      addressNumbers.length > 0 &&
      !addressNumbers.includes(addressNumberValue)
    ) {
      updates[MembershipFields.AddressNumber] = undefined;
    }

    if (addressFloors.length === 1 && !addressFloorValue) {
      updates[MembershipFields.AddressFloor] = addressFloors[0];
    } else if (
      addressFloorValue &&
      addressFloors.length > 0 &&
      !addressFloors.includes(addressFloorValue)
    ) {
      updates[MembershipFields.AddressFloor] = undefined;
    }

    if (addressDoors.length === 1 && !addressDoorValue) {
      updates[MembershipFields.AddressDoor] = addressDoors[0];
    } else if (
      addressDoorValue &&
      addressDoors.length > 0 &&
      !addressDoors.includes(addressDoorValue)
    ) {
      updates[MembershipFields.AddressDoor] = undefined;
    }

    if (Object.keys(updates).length) {
      form.setFieldsValue(updates);
    }
  }, [
    addressDoorValue,
    addressFloorValue,
    addressNumberValue,
    addressValue,
    form,
    isPostalComplete,
    postalTouched,
    recordsByParish,
  ]);

  const handlePostalChange = (value: string) => {
    const formattedValue = formatPostalCode(value) ?? "";
    const digits = formattedValue.replace(/\D/g, "");
    setPostalTouched(true);
    if (formattedValue.match(postalCodeRegex) && digits.length === 7) {
      setPostalLookupCode(digits);
    } else {
      setPostalLookupCode(null);
    }
  };

  const handleChange: UploadProps["onChange"] = async ({ file }) => {
    if (file) {
      const url = (await convertFileToBase64(file as RcFile)) as string;

      const value: IMemberPhoto = {
        file: url,
        filename: file.name,
        type: file.type!,
      };

      form.setFieldValue(MembershipFields.Photo, value);
    }
  };

  const onRemove: ButtonProps["onClick"] = (e) => {
    e.stopPropagation();
    form.setFieldValue(MembershipFields.Photo, undefined);
  };

  const uploadButton = (
    <div className="avatar-upload-placeholder">
      <PlusOutlined className="avatar-upload-icon" />
      <div className="avatar-upload-text">Foto</div>
    </div>
  );

  return (
    <div className={styles.section}>
      <Row gutter={16}>
        <Col span={24}>
          <Title level={3} className={`${styles.sectionTitle} text-uppercase`}>
            Informações Pessoais
          </Title>
        </Col>

        <Col xs={{ order: 1, span: 24 }} md={{ order: 1, span: 20 }}>
          <Row gutter={16}>
            <Form.Item name={MembershipFields.Id} label="Código" hidden>
              <Input placeholder="" className="w-full" />
            </Form.Item>

            <Col span={24}>
              <Form.Item
                name={MembershipFields.Fullname}
                label="Nome"
                rules={
                  isRequiredField(MembershipFields.Fullname)
                    ? [...requiredRules, ...personNameRules]
                    : personNameRules
                }
                getValueFromEvent={(event) =>
                  formatPersonName(event?.target?.value ?? "")
                }
              >
                <Input placeholder="Nome completo..." />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name={MembershipFields.BirthDate}
                label="Data de nascimento"
                rules={getRequiredRules(MembershipFields.BirthDate)}
              >
                <DatePicker
                  disabledDate={disabledDate}
                  format={dateInputFormat}
                  className="w-full"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name={MembershipFields.Email}
                label="Email"
                rules={emailRules}
              >
                <Input placeholder="email@dominio.com" type="email" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name={MembershipFields.Gender}
                label="Sexo"
                rules={getRequiredRules(MembershipFields.Gender)}
              >
                <Select
                  placeholder="Selecione o sexo"
                  options={genderOptions}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name={MembershipFields.MaritalStatus}
                label="Estado civil"
                rules={getRequiredRules(MembershipFields.MaritalStatus)}
              >
                <Select
                  placeholder="Selecione seu estado civil"
                  options={martitalOptions}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name={MembershipFields.PostalCode}
                label="Código postal"
                normalize={(value: string) => formatPostalCode(value)}
                getValueFromEvent={(event) =>
                  formatPostalCode(event?.target?.value ?? "")
                }
                rules={[
                  ...(isRequiredField(MembershipFields.PostalCode)
                    ? requiredRules
                    : []),
                  () => ({
                    validator(_, value: string) {
                      if (!value) {
                        return Promise.resolve();
                      }
                      if (value?.match(postalCodeRegex)) {
                        return Promise.resolve();
                      }
                      return Promise.reject("XXXX-XXX");
                    },
                  }),
                ]}
              >
                <Input
                  placeholder="XXXX-XXX"
                  inputMode="numeric"
                  pattern="[0-9]{4}-[0-9]{3}"
                  maxLength={8}
                  onChange={(event) =>
                    handlePostalChange(event?.target?.value ?? "")
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>

        <Col xs={{ order: 2, span: 24 }} md={{ order: 2, span: 4 }}>
          <Form.Item name={MembershipFields.Photo} noStyle>
            <Flex justify="center" align="start" className="h-full">
              <Upload
                listType="picture-circle"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleChange}
              >
                {imageUrl ? (
                  <div className="float-btn-container">
                    <Avatar
                      src={imageUrl}
                      size={128}
                      alt="userProfile"
                      className="w-full h-full"
                    />

                    <Tooltip title="Remover" placement="bottom">
                      <Button
                        shape="circle"
                        size="small"
                        icon={<DeleteOutlined />}
                        className="float-btn"
                        onClick={onRemove}
                      />
                    </Tooltip>
                  </div>
                ) : (
                  uploadButton
                )}
              </Upload>
            </Flex>
          </Form.Item>
        </Col>

        <Col xs={{ order: 3, span: 24 }}>
          <Form.Item
            name={MembershipFields.Address}
            label="Morada"
            rules={getRequiredRules(MembershipFields.Address)}
          >
            {addressOptions.length > 1 ? (
              <Select
                placeholder="Selecione a morada"
                options={addressOptions}
                loading={postalLoading}
                disabled={!parishValue}
                allowClear
                showSearch
                optionFilterProp="label"
              />
            ) : (
              <Input placeholder="Rua..." />
            )}
          </Form.Item>
        </Col>

        <Col xs={{ order: 3, span: 24 }} sm={8} md={8}>
          <Form.Item
            name={MembershipFields.AddressNumber}
            label="Número"
            rules={getRequiredRules(MembershipFields.AddressNumber)}
          >
            <Input placeholder="Ex: 123" />
          </Form.Item>
        </Col>

        <Col xs={{ order: 3, span: 24 }} sm={8} md={8}>
          <Form.Item name={MembershipFields.AddressFloor} label="Andar">
            <Input placeholder="Ex: 2º" />
          </Form.Item>
        </Col>

        <Col xs={{ order: 3, span: 24 }} sm={8} md={8}>
          <Form.Item
            name={MembershipFields.AddressDoor}
            label="Número da porta"
          >
            <Input placeholder="Ex: 3B" />
          </Form.Item>
        </Col>

        <Col xs={{ order: 3, span: 24 }} sm={12} md={8}>
          <Form.Item
            name={MembershipFields.State}
            label="Distrito"
            rules={getRequiredRules(MembershipFields.State)}
          >
            {districtOptions.length > 1 ? (
              <Select
                placeholder="Selecione o distrito"
                options={districtOptions}
                loading={postalLoading}
                allowClear
                showSearch={{
                  optionFilterProp: "label",
                  filterOption: selectFilterOption,
                }}
              />
            ) : (
              <Input placeholder="Informe o distrito" />
            )}
          </Form.Item>
        </Col>

        <Col xs={{ order: 3, span: 24 }} sm={12} md={8}>
          <Form.Item
            name={MembershipFields.County}
            label="Concelho"
            rules={getRequiredRules(MembershipFields.County)}
          >
            {countyOptions.length > 1 ? (
              <Select
                placeholder="Selecione o concelho"
                options={countyOptions}
                allowClear
                showSearch={{
                  optionFilterProp: "label",
                  filterOption: selectFilterOption,
                }}
              />
            ) : (
              <Input placeholder="Informe o concelho" />
            )}
          </Form.Item>
        </Col>

        <Col xs={{ order: 3, span: 24 }} sm={12} md={8}>
          <Form.Item
            name={MembershipFields.City}
            label="Freguesia"
            rules={getRequiredRules(MembershipFields.City)}
          >
            {parishOptions.length > 1 ? (
              <Select
                placeholder="Selecione a freguesia"
                options={parishOptions}
                allowClear
                showSearch={{
                  optionFilterProp: "label",
                  filterOption: selectFilterOption,
                }}
              />
            ) : (
              <Input placeholder="Informe a freguesia" />
            )}
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};
