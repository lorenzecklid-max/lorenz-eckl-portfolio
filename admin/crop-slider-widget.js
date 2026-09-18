// Custom Decap CMS widget: a draggable slider for the video crop-position
// fields (videoOffsetY / videoOffsetY2 in content/projects/*.json).
// Loaded after decap-cms.js in admin/index.html, which exposes the `h`
// (React.createElement) and `createClass` globals used here -- same
// no-build-tools approach as the rest of this site.
(function () {
  var CropSliderControl = createClass({
    getDefaultValue: function () {
      return 0;
    },
    handleChange: function (e) {
      this.props.onChange(Number(e.target.value));
    },
    handleReset: function () {
      this.props.onChange(0);
    },
    render: function () {
      var field = this.props.field;
      var min = field.get('min', -50);
      var max = field.get('max', 50);
      var step = field.get('step', 5);
      var value = this.props.value == null ? 0 : this.props.value;

      return h('div', { style: { padding: '4px 0' } },
        h('div', {
          style: { display: 'flex', alignItems: 'center', gap: '12px' }
        },
          h('span', { style: { fontSize: '12px', color: '#6a7382' } }, 'unten'),
          h('input', {
            type: 'range',
            min: min,
            max: max,
            step: step,
            value: value,
            onChange: this.handleChange,
            style: { flex: 1 }
          }),
          h('span', { style: { fontSize: '12px', color: '#6a7382' } }, 'oben'),
          h('span', {
            style: {
              minWidth: '48px', textAlign: 'right',
              fontVariantNumeric: 'tabular-nums', fontWeight: 600
            }
          }, (value > 0 ? '+' : '') + value + '%'),
          h('button', {
            type: 'button',
            onClick: this.handleReset,
            style: {
              border: '1px solid #d3d9e0', background: '#fff', borderRadius: '4px',
              padding: '4px 8px', fontSize: '12px', cursor: 'pointer'
            }
          }, 'Mitte')
        )
      );
    }
  });

  var CropSliderPreview = createClass({
    render: function () {
      var value = this.props.value == null ? 0 : this.props.value;
      return h('span', {}, (value > 0 ? '+' : '') + value + '%');
    }
  });

  CMS.registerWidget('cropSlider', CropSliderControl, CropSliderPreview);
})();
