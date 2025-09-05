---
title: Status Codes
order: 45
---

Status codes may be represented as a symbol instead of an integer for improved readability.

These values are derived from `Hanami::Http::Status::SYMBOLS`.

<dl class="row">
  <dt class="col-sm-1">100</dt>
  <dd class="col-sm-11">
    <code>:continue</code>
  </dd>
  <dt class="col-sm-1">101</dt>
  <dd class="col-sm-11">
    <code>:switching_protocols</code>
  </dd>
  <dt class="col-sm-1">102</dt>
  <dd class="col-sm-11">
    <code>:processing</code>
  </dd>
  <dt class="col-sm-1">103</dt>
  <dd class="col-sm-11">
    <code>:early_hints</code>
  </dd>
  <dt class="col-sm-1">200</dt>
  <dd class="col-sm-11">
    <code>:ok</code>
  </dd>
  <dt class="col-sm-1">201</dt>
  <dd class="col-sm-11">
    <code>:created</code>
  </dd>
  <dt class="col-sm-1">202</dt>
  <dd class="col-sm-11">
    <code>:accepted</code>
  </dd>
  <dt class="col-sm-1">203</dt>
  <dd class="col-sm-11">
    <code>:non_authoritative_information</code>
  </dd>
  <dt class="col-sm-1">204</dt>
  <dd class="col-sm-11">
    <code>:no_content</code>
  </dd>
  <dt class="col-sm-1">205</dt>
  <dd class="col-sm-11">
    <code>:reset_content</code>
  </dd>
  <dt class="col-sm-1">206</dt>
  <dd class="col-sm-11">
    <code>:partial_content</code>
  </dd>
  <dt class="col-sm-1">207</dt>
  <dd class="col-sm-11">
    <code>:multi_status</code>
  </dd>
  <dt class="col-sm-1">208</dt>
  <dd class="col-sm-11">
    <code>:already_reported</code>
  </dd>
  <dt class="col-sm-1">226</dt>
  <dd class="col-sm-11">
    <code>:im_used</code>
  </dd>
  <dt class="col-sm-1">300</dt>
  <dd class="col-sm-11">
    <code>:multiple_choices</code>
  </dd>
  <dt class="col-sm-1">301</dt>
  <dd class="col-sm-11">
    <code>:moved_permanently</code>
  </dd>
  <dt class="col-sm-1">302</dt>
  <dd class="col-sm-11">
    <code>:found</code>
  </dd>
  <dt class="col-sm-1">303</dt>
  <dd class="col-sm-11">
    <code>:see_other</code>
  </dd>
  <dt class="col-sm-1">304</dt>
  <dd class="col-sm-11">
    <code>:not_modified</code>
  </dd>
  <dt class="col-sm-1">305</dt>
  <dd class="col-sm-11">
    <code>:use_proxy</code>
  </dd>
  <dt class="col-sm-1">307</dt>
  <dd class="col-sm-11">
    <code>:temporary_redirect</code>
  </dd>
  <dt class="col-sm-1">308</dt>
  <dd class="col-sm-11">
    <code>:permanent_redirect</code>
  </dd>
  <dt class="col-sm-1">400</dt>
  <dd class="col-sm-11">
    <code>:bad_request</code>
  </dd>
  <dt class="col-sm-1">401</dt>
  <dd class="col-sm-11">
    <code>:unauthorized</code>
  </dd>
  <dt class="col-sm-1">402</dt>
  <dd class="col-sm-11">
    <code>:payment_required</code>
  </dd>
  <dt class="col-sm-1">403</dt>
  <dd class="col-sm-11">
    <code>:forbidden</code>
  </dd>
  <dt class="col-sm-1">404</dt>
  <dd class="col-sm-11">
    <code>:not_found</code>
  </dd>
  <dt class="col-sm-1">405</dt>
  <dd class="col-sm-11">
    <code>:method_not_allowed</code>
  </dd>
  <dt class="col-sm-1">406</dt>
  <dd class="col-sm-11">
    <code>:not_acceptable</code>
  </dd>
  <dt class="col-sm-1">407</dt>
  <dd class="col-sm-11">
    <code>:proxy_authentication_required</code>
  </dd>
  <dt class="col-sm-1">408</dt>
  <dd class="col-sm-11">
    <code>:request_timeout</code>
  </dd>
  <dt class="col-sm-1">409</dt>
  <dd class="col-sm-11">
    <code>:conflict</code>
  </dd>
  <dt class="col-sm-1">410</dt>
  <dd class="col-sm-11">
    <code>:gone</code>
  </dd>
  <dt class="col-sm-1">411</dt>
  <dd class="col-sm-11">
    <code>:length_required</code>
  </dd>
  <dt class="col-sm-1">412</dt>
  <dd class="col-sm-11">
    <code>:precondition_failed</code>
  </dd>
  <dt class="col-sm-1">413</dt>
  <dd class="col-sm-11">
    <code>:payload_too_large</code>
  </dd>
  <dt class="col-sm-1">414</dt>
  <dd class="col-sm-11">
    <code>:uri_too_long</code>
  </dd>
  <dt class="col-sm-1">415</dt>
  <dd class="col-sm-11">
    <code>:unsupported_media_type</code>
  </dd>
  <dt class="col-sm-1">416</dt>
  <dd class="col-sm-11">
    <code>:range_not_satisfiable</code>
  </dd>
  <dt class="col-sm-1">417</dt>
  <dd class="col-sm-11">
    <code>:expectation_failed</code>
  </dd>
  <dt class="col-sm-1">421</dt>
  <dd class="col-sm-11">
    <code>:misdirected_request</code>
  </dd>
  <dt class="col-sm-1">422</dt>
  <dd class="col-sm-11">
    <code>:unprocessable_entity</code>
  </dd>
  <dt class="col-sm-1">423</dt>
  <dd class="col-sm-11">
    <code>:locked</code>
  </dd>
  <dt class="col-sm-1">424</dt>
  <dd class="col-sm-11">
    <code>:failed_dependency</code>
  </dd>
  <dt class="col-sm-1">425</dt>
  <dd class="col-sm-11">
    <code>:too_early</code>
  </dd>
  <dt class="col-sm-1">426</dt>
  <dd class="col-sm-11">
    <code>:upgrade_required</code>
  </dd>
  <dt class="col-sm-1">428</dt>
  <dd class="col-sm-11">
    <code>:precondition_required</code>
  </dd>
  <dt class="col-sm-1">429</dt>
  <dd class="col-sm-11">
    <code>:too_many_requests</code>
  </dd>
  <dt class="col-sm-1">431</dt>
  <dd class="col-sm-11">
    <code>:request_header_fields_too_large</code>
  </dd>
  <dt class="col-sm-1">451</dt>
  <dd class="col-sm-11">
    <code>:unavailable_for_legal_reasons</code>
  </dd>
  <dt class="col-sm-1">500</dt>
  <dd class="col-sm-11">
    <code>:internal_server_error</code>
  </dd>
  <dt class="col-sm-1">501</dt>
  <dd class="col-sm-11">
    <code>:not_implemented</code>
  </dd>
  <dt class="col-sm-1">502</dt>
  <dd class="col-sm-11">
    <code>:bad_gateway</code>
  </dd>
  <dt class="col-sm-1">503</dt>
  <dd class="col-sm-11">
    <code>:service_unavailable</code>
  </dd>
  <dt class="col-sm-1">504</dt>
  <dd class="col-sm-11">
    <code>:gateway_timeout</code>
  </dd>
  <dt class="col-sm-1">505</dt>
  <dd class="col-sm-11">
    <code>:http_version_not_supported</code>
  </dd>
  <dt class="col-sm-1">506</dt>
  <dd class="col-sm-11">
    <code>:variant_also_negotiates</code>
  </dd>
  <dt class="col-sm-1">507</dt>
  <dd class="col-sm-11">
    <code>:insufficient_storage</code>
  </dd>
  <dt class="col-sm-1">508</dt>
  <dd class="col-sm-11">
    <code>:loop_detected</code>
  </dd>
  <dt class="col-sm-1">509</dt>
  <dd class="col-sm-11">
    <code>:bandwidth_limit_exceeded</code>
  </dd>
  <dt class="col-sm-1">510</dt>
  <dd class="col-sm-11">
    <code>:not_extended</code>
  </dd>
  <dt class="col-sm-1">511</dt>
  <dd class="col-sm-11">
    <code>:network_authentication_required</code>
  </dd>
</dl>
