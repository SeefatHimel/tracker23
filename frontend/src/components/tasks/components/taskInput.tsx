import {
  Button,
  Checkbox,
  Form,
  Input,
  RadioChangeEvent,
  Select,
  SelectProps,
  TimePicker,
} from "antd";
import React, { useState } from "react";

import { SizeType } from "antd/es/config-provider/SizeContext";
import { CheckboxChangeEvent } from "antd/es/checkbox";

const TaskInput = ({ taskList, createTask }: any) => {
  const [form] = Form.useForm();
  const onFinish = async (values: any) => {
    console.log(values);
    if (typeof values.estimation !== "number")
      values.estimation = +values.estimation;

    const res = createTask(values);
    console.log("🚀 ~ file: taskInput copy.tsx:23 ~ onFinish ~ res", res);
  };

  const onReset = () => {
    form.resetFields();
  };
  const [size, setSize] = useState<SizeType>("middle");
  const [recurrentTask, setRecurrentTask] = useState<boolean>(false);
  const handleSizeChange = (e: RadioChangeEvent) => {
    setSize(e.target.value);
  };
  const handlePriorityChange = (value: string) => {
    console.log(`Selected: ${value}`);
  };
  const handleTagsChange = (value: string[]) => {
    console.log(`Selected: ${value}`);
  };
  const options: SelectProps["options"] = [];
  const initialValues = {
    priority: "MEDIUM",
  };
  const onCheckBoxChange = (e: CheckboxChangeEvent) => {
    setRecurrentTask(e.target.checked);
  };
  return (
    <Form
      form={form}
      name="control-hooks"
      onFinish={onFinish}
      initialValues={initialValues}
      // style={{ width: "500px" }}
    >
      <Form.Item
        name="title"
        label="Task Name"
        rules={[{ required: true }]}
        labelCol={{ span: 24 }}
      >
        <Input placeholder="Enter your task name" />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        // initialValue={"sample description"}
        labelCol={{ span: 24 }}
        // rules={[{ required: true }]}
      >
        <Input placeholder="Enter text here..." />
      </Form.Item>
      <div className="grid w-full grid-cols-2 gap-3">
        <Form.Item
          name="estimation"
          // initialValue={2}
          label="Estimation (in hours)"
          labelCol={{ span: 24 }}
          rules={[{ required: true }]}
        >
          <Input type="number" placeholder="hours" />
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
          labelCol={{ span: 24 }}
          rules={[{ required: true }]}
        >
          {/* <Input /> */}
          <Select
            onChange={handlePriorityChange}
            options={[
              { value: "LOW", label: "LOW" },
              { value: "MEDIUM", label: "MEDIUM" },
              { value: "HIGH", label: "HIGH" },
            ]}
          />
        </Form.Item>
      </div>

      <Form.Item name="label" label="Label" labelCol={{ span: 24 }}>
        {/* <Input /> */}

        <Select
          mode="tags"
          size={size}
          placeholder="Please select"
          defaultValue={["Bug Fix"]}
          onChange={handleTagsChange}
          style={{ width: "100%" }}
          options={options}
        />
      </Form.Item>

      <Form.Item>
        <Checkbox onChange={onCheckBoxChange}>Recurrent Task</Checkbox>
      </Form.Item>
      {recurrentTask && (
        <div className="grid w-full grid-cols-2 gap-3">
          <Form.Item
            name="frequency"
            label="Frequency"
            labelCol={{ span: 24 }}
            rules={[{ required: true }]}
          >
            {/* <Input /> */}
            <Select
              placeholder="Select Frequency"
              onChange={handlePriorityChange}
              options={[
                { value: "Daily", label: "Daily" },
                { value: "Weekly", label: "Weekly" },
                { value: "Bi-Weekly", label: "Bi-Weekly" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="time"
            label="Time"
            labelCol={{ span: 24 }}
            rules={[{ required: true }]}
          >
            <TimePicker.RangePicker />
          </Form.Item>
        </div>
      )}

      <Form.Item>
        <div className="flex flex-row-reverse gap-3">
          <Button
            type="ghost"
            htmlType="submit"
            className="bg-[#00A3DE] text-white hover:bg-[#00a3deb2]"
          >
            Submit
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default TaskInput;
