import { useState } from "react";
import { Collapse, Select, Slider, Button, Tag } from "antd";
import { Filter, X } from "lucide-react";
import _ from "lodash";

const { Panel } = Collapse;

const FilterSection = ({ filters, setFilters, availableFilters }) => {
  const [activeKey, setActiveKey] = useState(["0"]);

  const handleSliderChange = (value, type) => {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  return (
    <Collapse
      className="mb-6 rounded-lg shadow"
      expandIconPosition="end"
      activeKey={activeKey}
      onChange={(keys) => setActiveKey(keys)}
    >
      <Panel
        header={
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {Object.values(filters).some((f) =>
              Array.isArray(f) ? f.length > 0 : false
            ) && (
              <Tag color="blue" className="ml-2">
                Active Filters
              </Tag>
            )}
          </div>
        }
        key="1"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sectors</label>
            <Select
              mode="multiple"
              placeholder="Select sectors"
              value={filters.sectors}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, sectors: value }))
              }
              options={availableFilters.sectors.map((s) => ({
                label: s,
                value: s,
              }))}
              className="w-full"
              allowClear
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Locations</label>
            <Select
              mode="multiple"
              placeholder="Select locations"
              value={filters.locations}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, locations: value }))
              }
              options={availableFilters.locations.map((l) => ({
                label: l,
                value: l,
              }))}
              className="w-full"
              allowClear
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Industries</label>
            <Select
              mode="multiple"
              placeholder="Select industries"
              value={filters.industries}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, industries: value }))
              }
              options={availableFilters.industries.map((i) => ({
                label: i,
                value: i,
              }))}
              className="w-full"
              allowClear
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="p-4 rounded-lg">
            <label className="block text-sm font-medium mb-4">
              Investment Range
            </label>
            <Slider
              range
              min={0}
              max={availableFilters.maxInvestment}
              value={filters.investmentRange}
              onChange={(value) => handleSliderChange(value, "investmentRange")}
              tooltip={{
                formatter: (value) => `$${value.toLocaleString()}`,
              }}
              className="mt-2"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Preferred Startup Stage
            </label>
            <Select
              mode="multiple"
              placeholder="Select stages"
              value={filters.startupStage}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, startupStage: value }))
              }
              options={availableFilters.startupStages.map((s) => ({
                label: s,
                value: s,
              }))}
              className="w-full"
              allowClear
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="p-4 rounded-lg">
            <label className="block text-sm font-medium mb-4">
              Establishment Year
            </label>
            <Slider
              range
              min={1900}
              max={new Date().getFullYear()}
              value={filters.establishedYear}
              onChange={(value) => handleSliderChange(value, "establishedYear")}
              tooltip={{
                formatter: (value) => value,
              }}
              className="mt-2"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            icon={<X className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation();
              setFilters({
                sectors: [],
                locations: [],
                industries: [],
                investmentRange: [0, availableFilters.maxInvestment],
                startupStage: [],
                establishedYear: [1900, new Date().getFullYear()],
              });
            }}
          >
            Clear All Filters
          </Button>
        </div>
      </Panel>
    </Collapse>
  );
};

export default FilterSection;
