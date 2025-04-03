import { useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import { PushpinOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Form, Input, Button, Alert, Select } from "antd";

import {
  GET_TOWNSHIPS,
  CREATE_ADDRESS,
  GET_MY_ADDRESSES,
} from "../../graphql/delivery";

import "mapbox-gl/dist/mapbox-gl.css";

interface AddressFormValues {
  township_id: string;
  address_line: string;
  latitude: number;
  longitude: number;
  zip_code: string;
  contact_number: string;
  contact_name: string;
}

interface Township {
  id: string;
  name: string;
  zipcode: string;
}

type Addresses = {
  myAddresses: unknown[];
} | null;

interface AddressFormProps {
  onSuccess?: () => void;
}

export function AddressForm({ onSuccess }: AddressFormProps) {
  const [form] = Form.useForm<AddressFormValues>();
  const [location, setLocation] = useState({
    latitude: 16.8233653,
    longitude: 96.1193862,
  });

  const { data: townshipsData } = useQuery(GET_TOWNSHIPS);

  const [createAddress, { loading, error }] = useMutation(CREATE_ADDRESS, {
    update(cache, { data: { createAddress } }) {
      const existingAddresses: Addresses = cache.readQuery({
        query: GET_MY_ADDRESSES,
      });
      cache.writeQuery({
        query: GET_MY_ADDRESSES,
        data: {
          myAddresses: [
            ...(existingAddresses?.myAddresses ?? []),
            createAddress,
          ],
        },
      });
    },
    onCompleted: () => {
      form.resetFields();
      onSuccess?.();
    },
  });

  const handleSubmit = async (values: AddressFormValues) => {
    await createAddress({
      variables: {
        createAddressInput: {
          ...values,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      },
    });
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${
          import.meta.env.VITE_MAP_BOX_PUBLIC_TOKEN
        }`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const address = data.features[0].properties.full_address;
        const township = address.split(",")[0];

        const townshipData = townshipsData?.townships.find(
          (t: Township) => t.name === township
        );

        form.setFieldsValue({
          address_line: address,
          ...(townshipData && {
            township_id: townshipData.id,
            zip_code: townshipData.zipcode,
          }),
        });
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{ maxWidth: "100%" }}
    >
      {error && (
        <Form.Item>
          <Alert type="error" message={error.message} showIcon />
        </Form.Item>
      )}

      <Form.Item
        label="Township"
        name="township_id"
        rules={[{ required: true, message: "Please select township" }]}
        help="This value will be auto filled based on the selected location"
      >
        <Select
          disabled
          placeholder="Select township"
          options={townshipsData?.townships.map((township: Township) => ({
            label: township.name,
            value: township.id,
          }))}
          onChange={(value) => {
            const township = townshipsData?.townships.find(
              (t: Township) => t.id === value
            );
            form.setFieldsValue({ zip_code: township.zipcode });
          }}
        />
      </Form.Item>

      <Form.Item
        label="Address Line"
        name="address_line"
        rules={[{ required: true, message: "Please enter address" }]}
        help="Please adjust the address line manually in case of mistakes"
      >
        <Input placeholder="Enter address line" />
      </Form.Item>

      <Form.Item
        label="Contact Name"
        name="contact_name"
        rules={[{ required: true, message: "Please enter a contact name" }]}
      >
        <Input placeholder="Contact Name" />
      </Form.Item>

      <Form.Item
        label="Contact Number"
        name="contact_number"
        rules={[
          { required: true, message: "Please enter contact number" },
          {
            validator: (_, value) => {
              if (!value || isValidPhoneNumber(value, "MM")) {
                return Promise.resolve();
              }
              return Promise.reject("Invalid Myanmar phone number");
            },
            validateTrigger: "onChange",
          },
        ]}
      >
        <Input
          placeholder="Enter contact number"
          onChange={() => {
            form.validateFields(["contact_number"]);
          }}
        />
      </Form.Item>

      <Form.Item
        label="Location"
        help="Please pin the location on the map"
        required
      >
        <div style={{ height: 300 }}>
          <Map
            mapboxAccessToken={import.meta.env.VITE_MAP_BOX_PUBLIC_TOKEN}
            initialViewState={{
              longitude: location.longitude,
              latitude: location.latitude,
              zoom: 14,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            onClick={(evt) => {
              const newLocation = {
                latitude: evt.lngLat.lat,
                longitude: evt.lngLat.lng,
              };
              setLocation(newLocation);
              reverseGeocode(newLocation.latitude, newLocation.longitude);
            }}
          >
            <Marker
              longitude={location.longitude}
              latitude={location.latitude}
              anchor="bottom"
            >
              <PushpinOutlined style={{ fontSize: "2rem", color: "#1677ff" }} />
            </Marker>
          </Map>
        </div>
      </Form.Item>

      <Form.Item
        label="ZIP Code"
        name="zip_code"
        rules={[{ required: true, message: "Please enter ZIP code" }]}
        hidden
      >
        <Input placeholder="Enter ZIP code" />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          style={{ marginTop: "14px" }}
        >
          Add Address
        </Button>
      </Form.Item>
    </Form>
  );
}
